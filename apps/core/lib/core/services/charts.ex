defmodule Core.Services.Charts do
  use Core.Services.Base
  import Core.Policies.Chart

  alias Core.Services.Repositories
  alias Core.Schema.{
    Chart,
    User,
    ChartInstallation,
    Version,
    Repository
  }

  def get_chart(chart_id), do: Core.Repo.get(Chart, chart_id)

  def get_chart!(chart_id), do: Core.Repo.get!(Chart, chart_id)

  def get_chart_version(chart_id, version),
    do: Core.Repo.get_by(Version, chart_id: chart_id, version: version)

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

  def upload_chart(%{"chart" => chart} = uploads, %Repository{id: repo_id, name: repo}, user, context) do
    {chart_name, version} = chart_info(chart)
    uploads = Enum.map(uploads, fn {key, %{path: path, filename: file}} ->
      {:file, path, {"form-data", [{"name", key}, {"filename", Path.basename(file)}]}, []}
    end)

    start_transaction()
    |> add_operation(:chart, fn _ ->
      %{name: chart_name, latest_version: version}
      |> create_chart(repo_id, user)
    end)
    |> add_operation(:cm, fn _ ->
      url = Path.join([chartmuseum(), "api", repo, "charts"])

      opts = [timeout: :infinity, recv_timeout: :infinity] ++ context.opts
      HTTPoison.post(url, {:multipart, uploads}, context.headers, opts)
    end)
    |> add_operation(:sync, fn %{chart: %{id: id}} ->
      with {:ok, helm_info} <- extract_chart_meta(chart_name, chart.path) do
        sync_version(helm_info, id, version)
      end
    end)
    |> add_operation(:sync_chart, fn %{sync: %{helm: helm}, chart: chart} ->
      chart
      |> Chart.changeset(from_version(helm))
      |> Core.Repo.update()
    end)
    |> execute()
  end

  def sync_version(attrs, chart_id, version) do
    get_chart_version(chart_id, version)
    |> Ecto.Changeset.change(attrs)
    |> Core.Repo.update()
  end

  defp from_version(%{} = attrs), do: Map.take(attrs, ~w(description))
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

  def create_chart_installation(attrs, installation_id, %User{} = user) do
    installation = Repositories.get_installation!(installation_id)

    %ChartInstallation{installation_id: installation.id, installation: installation}
    |> ChartInstallation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  def extract_chart_meta(chart, path) do
    readme_file = String.to_charlist("#{chart}/README.md")
    chart_file  = String.to_charlist("#{chart}/Chart.yaml")

    with {:ok, result} <- String.to_charlist(path)
                          |> :erl_tar.extract([:memory, :compressed, {:files, [readme_file, chart_file]}]),
         {_, readme} <- Enum.find(result, &elem(&1, 0) == readme_file),
         {_, chart_yaml} <- Enum.find(result, &elem(&1, 0) == chart_file),
         {:ok, chart_decoded} <- YamlElixir.read_from_string(chart_yaml),
      do: {:ok, %{readme: readme, helm: chart_decoded}}
  end

  def authorize(chart_id, %User{} = user) when is_binary(chart_id) do
    get_chart!(chart_id)
    |> authorize(user)
  end
  def authorize(%Chart{} = chart, user),
    do: allow(chart, user, :access)

  defp update_latest_version(%Chart{} = chart, v) do
    Chart.changeset(chart, %{latest_version: v})
    |> Core.Repo.update()
  end
end