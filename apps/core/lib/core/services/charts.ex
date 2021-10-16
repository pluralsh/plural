defmodule Core.Services.Charts do
  use Core.Services.Base
  import Core.Policies.Chart

  alias Core.Services.{Repositories, Dependencies, Versions}
  alias Core.Schema.{
    Chart,
    User,
    ChartInstallation,
    Version,
    Repository,
    VersionTag,
    Crd,
    ImageDependency
  }

  @spec get_chart(binary) :: Chart.t | nil
  def get_chart(chart_id), do: Core.Repo.get(Chart, chart_id)

  @spec get_chart!(binary) :: Chart.t
  def get_chart!(chart_id), do: Core.Repo.get!(Chart, chart_id)

  @spec get_chart_by_name!(binary, binary) :: Chart.t
  def get_chart_by_name!(repo_id, name),
    do: Core.Repo.get_by!(Chart, repository_id: repo_id, name: name)

  @spec get_chart_by_name(binary, binary) :: Chart.t
  def get_chart_by_name(repo_id, name),
    do: Core.Repo.get_by(Chart, repository_id: repo_id, name: name)

  @spec get_chart_version(binary, binary) :: Version.t | nil
  def get_chart_version(chart_id, version),
    do: Core.Repo.get_by(Version, chart_id: chart_id, version: version)

  @spec get_tag(binary, binary) :: VersionTag.t | nil
  def get_tag(chart_id, tag), do: Core.Repo.get_by(VersionTag, chart_id: chart_id, tag: tag)


  @spec get_latest_version(binary) :: Version.t | nil
  def get_latest_version(chart_id) do
    with %Chart{latest_version: version} <- get_chart(chart_id),
      do: get_chart_version(chart_id, version)
  end

  @spec get_chart_installation(binary, binary) :: ChartInstallation.t | nil
  def get_chart_installation(chart_id, user_id) do
    ChartInstallation.for_chart(chart_id)
    |> ChartInstallation.for_user(user_id)
    |> Core.Repo.one()
  end

  @spec list_charts_and_versions(binary) :: [Chart.t]
  def list_charts_and_versions(repo) do
    Chart.for_repository(repo)
    |> Chart.preload_versions()
    |> Chart.ordered()
    |> Core.Repo.all()
  end

  @doc """
  Creates a new chart. Fails if the user is not the publisher of the repository
  """
  @spec create_chart(map, binary, User.t) :: {:ok, Chart.t} | {:error, term}
  def create_chart(attrs, repository_id, %User{} = user) do
    name = stringish_fetch(attrs, :name)

    start_transaction()
    |> add_operation(:chart, fn _ ->
      case Core.Repo.get_by(Chart, repository_id: repository_id, name: name) do
        %Chart{} = chart -> chart
        _ -> %Chart{repository_id: repository_id}
      end
      |> Chart.changeset(attrs)
      |> Core.Repo.insert_or_update()
    end)
    |> add_operation(:version, fn %{chart: %Chart{id: id, latest_version: v}} ->
      Versions.create_version(%{version: v}, :helm, id, user)
    end)
    |> execute(extract: :chart)
  end

  @spec update_chart(map, binary, User.t) :: {:ok, Chart.t} | {:error, term}
  def update_chart(attrs, chart_id, %User{} = user) do
    get_chart!(chart_id)
    |> Core.Repo.preload([:tags])
    |> Chart.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
  end

  @doc """
  Handles a chart upload.  Performs metadata extraction on the tarball, along
  with inferring the appropriate version and persisting everything to the
  repository.  It will also send the update to chartmuseum transactionally.

  Fails if the user is not the rzpublisher of the repository.
  """
  @spec upload_chart(map, Repository.t, User.t, map) :: {:ok, Chart.t} | {:error, term}
  def upload_chart(%{"chart" => chart} = uploads, %Repository{id: repo_id, name: repo}, user, context) do
    {chart_name, version} = chart_info(chart)
    uploads = Enum.map(uploads, fn {key, %{path: path, filename: file}} ->
      {:file, path, {"form-data", [{"name", key}, {"filename", Path.basename(file)}]}, []}
    end)

    with {:ok, helm_info} <- extract_chart_meta(chart_name, chart.path) do
      start_transaction()
      |> add_operation(:chart, fn _ ->
        %{name: chart_name, latest_version: version}
        |> create_chart(repo_id, user)
      end)
      |> add_operation(:imgs, fn %{chart: %{id: chart_id}} ->
        v = get_chart_version(chart_id, version)

        with {:ok, imgs} <- image_dependencies(chart.path, helm_info.values_template) do
          deps = Enum.map(imgs, &timestamped(%{image_id: &1.id, version_id: v.id}))

          {_, deps} = Core.Repo.insert_all(ImageDependency, deps, [
            returning: true,
            on_conflict: :replace_all,
            conflict_target: [:version_id, :image_id]
          ])
          {:ok, deps}
        end
      end)
      |> add_operation(:cm, fn _ ->
        url = Path.join([chartmuseum(), "cm", "api", repo, "charts"])

        opts = [timeout: :infinity, recv_timeout: :infinity] ++ context.opts
        HTTPoison.post(url, {:multipart, uploads}, context.headers, opts)
      end)
      |> add_operation(:sync, fn %{chart: %{id: id}} ->
        sync_version(helm_info, id, version)
      end)
      |> add_operation(:sync_chart, fn %{sync: version, chart: chart} ->
        chart
        |> Chart.changeset(
          from_version(version)
          |> Map.put(:dependencies, helm_info.dependencies)
        )
        |> Core.Repo.update()
      end)
      |> sync_crds(helm_info.crds, user)
      |> execute()
      |> case do
        {:ok, %{sync: sync}} = res ->
          Versions.notify(sync, :create, user)
          res
        error -> error
      end
    end
  end

  @doc """
  Syncs attrs against a chart version.  For internal use only
  """
  @spec sync_version(map, binary, Version.t) :: {:ok, Version.t} | {:error, %Ecto.Changeset{}}
  def sync_version(attrs, chart_id, version) do
    get_chart_version(chart_id, version)
    |> Version.helm_changeset(attrs)
    |> Core.Repo.update()
  end

  @doc """
  Create a new crd.  If one exists for this version, name, the old crd is overwritten
  """
  @spec create_crd(map, binary, User.t) :: {:ok, Crd.t} | {:error, %Ecto.Changeset{}}
  def create_crd(%{name: name} = attrs, version_id, %User{} = user) do
    case Core.Repo.get_by(Crd, version_id: version_id, name: name) do
      nil -> %Crd{version_id: version_id}
      crd -> crd
    end
    |> Crd.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(&Core.Repo.insert_or_update/1)
  end

  def sync_crds(transaction, [_ | _] = crds, user) do
    Enum.reduce(crds, transaction, fn {name, content}, xact ->
      add_operation(xact, {:crd, name}, fn %{sync: %{id: id}} ->
        {:ok, path} = Briefly.create()
        File.write!(path, IO.inspect(content))
        name = Path.basename(name)
        create_crd(%{name: name, blob: %{
          __struct__: Plug.Upload,
          path: path,
          filename: name,
          content_type: MIME.from_path(name)
        }}, id, user)
      end)
    end)
  end
  def sync_crds(transaction, _, _), do: transaction

  defp from_version(%Version{helm: helm}), do: %{description: helm && helm["description"]}
  defp from_version(_), do: %{}

  def chart_info(%{filename: filename}) do
    Path.rootname(filename)
    |> Path.basename()
    |> String.split("-")
    |> Enum.reverse()
    |> case do
      [version | rest] ->
        chart = Enum.reverse(rest) |> Enum.join("-")
        {chart, version}
      _ -> :error
    end
  end

  defp image_dependencies(chart, values) do
    {:ok, f} = Briefly.create()
    File.write!(f, values)

    with {:ok, tpl} <- Plural.Cmd.template(chart, f),
         {:ok, imgs} <- Plural.Chart.images(tpl) do
      dkr_dns = Core.conf(:registry)

      imgs
      |> Enum.filter(&String.starts_with?(&1, dkr_dns))
      |> Enum.map(&String.trim_leading(&1, dkr_dns <> "/"))
      |> Enum.map(fn registry ->
        with [repo, repository] <- String.split(registry, "/"),
             [repository, tag] <- String.split(repository, ":") do
          Repositories.get_dkr_image(repo, repository, tag)
        else
          _ -> nil
        end
      end)
      |> Enum.filter(& &1)
      |> Enum.uniq_by(& &1.id)
      |> ok()
    end
  end

  defp chartmuseum(), do: Application.get_env(:core, :chartmuseum)

  @doc """
  Creates a new chart installation for a repository installation.

  Fails if the user is not the installer
  """
  @spec create_chart_installation(map, binary, User.t) :: {:ok, ChartInstallation.t} | {:error, term}
  def create_chart_installation(attrs, installation_id, %User{} = user) do
    installation = Repositories.get_installation!(installation_id)

    %ChartInstallation{installation_id: installation.id, installation: installation}
    |> ChartInstallation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  @doc """
  Updates the chart installation. Fails if the user is not the original installer
  """
  @spec update_chart_installation(map, binary, User.t) :: {:ok, ChartInstallation.t} | {:error, term}
  def update_chart_installation(attrs, chart_inst_id, %User{} = user) do
    Core.Repo.get!(ChartInstallation, chart_inst_id)
    |> Core.Repo.preload([:installation, :chart, :version])
    |> ChartInstallation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:update)
  end

  def update_latest_version(%Chart{} = chart, v) do
    Chart.changeset(chart, %{latest_version: v})
    |> Core.Repo.update()
  end

  def extract_chart_meta(chart, path) do
    readme_file  = String.to_charlist("#{chart}/README.md")
    chart_file   = String.to_charlist("#{chart}/Chart.yaml")
    val_template = String.to_charlist("#{chart}/values.yaml.tpl")
    deps_tmplate = String.to_charlist("#{chart}/deps.yaml")

    with {:ok, result} <- String.to_charlist(path)
                          |> :erl_tar.extract([:memory, :compressed]),
         {:readme, {_, readme}} <- {:readme, Enum.find(result, &elem(&1, 0) == readme_file)},
         {:chart, {_, chart_yaml}} <- {:chart, Enum.find(result, &elem(&1, 0) == chart_file)},
         {:ok, chart_decoded} <- YamlElixir.read_from_string(chart_yaml),
         {:ok, deps} <- Dependencies.extract_dependencies(result, deps_tmplate) do
      {:ok, %{
        readme: readme,
        helm: chart_decoded,
        digest: Piazza.File.hash(path),
        values_template: extract_val_template(result, val_template),
        dependencies: deps,
        crds: get_crds(result, "#{chart}/crds/")
      }}
    else
      {:readme, _} -> {:error, "could not find README.md"}
      {:chart, _} -> {:error, "could not find Chart.yaml"}
      error -> error
    end
  end

  def get_crds(tarball, prefix) do
    Enum.map(tarball, fn {name, val} -> {to_string(name), val} end)
    |> Enum.map(&IO.inspect/1)
    |> Enum.map(fn {name, val} ->
      case String.starts_with?(name, prefix) do
        true -> {name, val}
        _ -> nil
      end
    end)
    |> Enum.filter(& &1)
  end

  defp extract_val_template(result, val_template) do
    case Enum.find(result, &elem(&1, 0) == val_template) do
      {_, template} -> template
      _ -> nil
    end
  end

  @doc """
  Returns true iff the user can `:access` the chart
  """
  @spec authorize(binary | Chart.t, User.t) :: boolean
  def authorize(chart_id, %User{} = user) when is_binary(chart_id),
    do: get_chart!(chart_id) |> authorize(user)
  def authorize(%Chart{} = chart, user), do: allow(chart, user, :access)
end
