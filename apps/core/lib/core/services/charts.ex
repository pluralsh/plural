defmodule Core.Services.Charts do
  use Core.Services.Base
  import Core.Policies.Chart

  alias Core.Services.{Repositories, Dependencies}
  alias Core.PubSub
  alias Core.Schema.{
    Chart,
    User,
    ChartInstallation,
    Version,
    Repository
  }

  @spec get_chart(binary) :: Chart.t | nil
  def get_chart(chart_id), do: Core.Repo.get(Chart, chart_id)

  @spec get_chart!(binary) :: Chart.t
  def get_chart!(chart_id), do: Core.Repo.get!(Chart, chart_id)

  @spec get_chart_by_name!(binary, binary) :: Chart.t
  def get_chart_by_name!(repo_id, name),
    do: Core.Repo.get_by!(Chart, repository_id: repo_id, name: name)

  @spec get_chart_version(binary, binary) :: Version.t | nil
  def get_chart_version(chart_id, version),
    do: Core.Repo.get_by(Version, chart_id: chart_id, version: version)

  @spec get_chart_installation(binary, binary) :: ChartInstallation.t | nil
  def get_chart_installation(chart_id, user_id) do
    ChartInstallation.for_chart(chart_id)
    |> ChartInstallation.for_user(user_id)
    |> Core.Repo.one()
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
      create_version(%{version: v}, id, user)
    end)
    |> execute(extract: :chart)
  end

  @doc """
  Creates a new version for a chart.  Fails if the user is not the publisher
  """
  @spec create_version(map, binary, User.t) :: {:ok, Version.t} | {:error, term}
  def create_version(attrs, chart_id, %User{} = user) do
    version = stringish_fetch(attrs, :version)

    start_transaction()
    |> add_operation(:version, fn _ ->
      case get_chart_version(chart_id, version) do
        %Version{} = v -> v
        _ ->%Version{chart_id: chart_id}
      end
      |> Version.changeset(attrs)
      |> allow(user, :create)
      |> when_ok(&Core.Repo.insert_or_update/1)
    end)
    |> add_operation(:bump, fn %{version: %{version: v}} ->
      chart = get_chart(chart_id)
      case Elixir.Version.compare(v, chart.latest_version) do
        :gt -> update_latest_version(chart, v)
        _ -> {:ok, chart}
      end
    end)
    |> execute(extract: :version)
  end

  @doc """
  Handles a chart upload.  Performs metadata extraction on the tarball, along
  with inferring the appropriate version and persisting everything to the
  repository.  It will also send the update to chartmuseum transactionally.

  Fails if the user is not the publisher of the repository.
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
      |> execute()
      |> case do
        {:ok, %{sync: sync}} = res ->
          notify(sync, :create)
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

  defp from_version(%Version{helm: helm}), do: %{description: helm && helm["description"]}
  defp from_version(_), do: %{}

  defp chart_info(%{filename: filename}) do
    Path.rootname(filename)
    |> Path.basename()
    |> String.split("-")
    |> case do
      [chart | rest] -> {chart, Enum.join(rest, "-")}
      _ -> :error
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

  def extract_chart_meta(chart, path) do
    readme_file  = String.to_charlist("#{chart}/README.md")
    chart_file   = String.to_charlist("#{chart}/Chart.yaml")
    val_template = String.to_charlist("#{chart}/values.yaml.gotpl")
    deps_tmplate = String.to_charlist("#{chart}/deps.yaml")
    files = [readme_file, chart_file, val_template, deps_tmplate]

    with {:ok, result} <- String.to_charlist(path)
                          |> :erl_tar.extract([:memory, :compressed, {:files, files}]),
         {_, readme} <- Enum.find(result, &elem(&1, 0) == readme_file),
         {_, chart_yaml} <- Enum.find(result, &elem(&1, 0) == chart_file),
         {:ok, chart_decoded} <- YamlElixir.read_from_string(chart_yaml),
         {:ok, deps} <- Dependencies.extract_dependencies(result, deps_tmplate) do
      {:ok, %{
        readme: readme,
        helm: chart_decoded,
        values_template: extract_val_template(result, val_template),
        dependencies: deps}}
    end
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

  defp update_latest_version(%Chart{} = chart, v) do
    Chart.changeset(chart, %{latest_version: v})
    |> Core.Repo.update()
  end

  defp notify(%Version{} = v, :create),
    do: handle_notify(PubSub.VersionCreated, v)
  defp notify(error, _), do: error
end