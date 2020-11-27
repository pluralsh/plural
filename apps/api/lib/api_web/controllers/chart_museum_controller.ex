defmodule ApiWeb.ChartMuseumController do
  use ApiWeb, :controller
  import ApiWeb.Plugs.ReverseProxy
  alias Core.Services.{Charts, Repositories}
  alias Core.Policies.Repository, as: RepoPolicy
  alias Core.Schema.Version

  plug :fetch_repository
  plug :authorize

  def index(conn, %{"repo" => repo}) do
    url = Path.join([chartmuseum(), "cm", repo, "index.yaml"])

    execute_proxy(:get, url, conn)
  end

  def index_db(conn, %{"repo" => _}) do
    charts = Charts.list_charts_and_versions(conn.assigns.repo.id)

    json(conn, %{
      apiVersion: "v1",
      entries: Enum.into(charts, %{}, fn %{name: name, versions: versions} ->
        {name, Enum.map(versions, &cm_version(&1, name))}
      end),
      generated: Timex.now(),
      serverInfo: %{contextPath: "/cm"}
    })
  end

  defp cm_version(%Version{helm: helm, digest: digest, inserted_at: at, version: v}, chart) do
    %{"created" => at, "digest" => digest, "urls" => ["charts/#{chart}-#{v}.tgz"]}
    |> Map.merge(helm)
  end

  def get(conn, %{"repo" => repo, "chart" => chart}) do
    url = Path.join([chartmuseum(), "cm", repo, "charts", chart])

    execute_proxy(:get, url, conn)
  end

  def create_chart(conn, %{"repo" => repo} = params) do
    current_user = Guardian.Plug.current_resource(conn)
    opts = ReverseProxyPlug.init(response_mode: :buffer)
    url = Path.join([chartmuseum(), "cm", "api", repo, "charts"])

    Map.take(params, ["chart", "prov"])
    |> Charts.upload_chart(conn.assigns.repo, current_user, %{opts: opts, headers: proxy_headers(conn, url)})
    |> case do
      {:ok, %{cm: resp}} -> {:ok, resp} |> ReverseProxyPlug.response(conn, opts)
      error -> error
    end
  end

  def create_prov(conn, %{"repo" => repo, "prov" => %{filename: file}}) do
    url = Path.join([chartmuseum(), "cm", "api", repo, "prov"])
    opts = ReverseProxyPlug.init([])

    HTTPoison.post(
      url,
      {:multipart, {:file, file, {"form-data", [name: "prov", filename: Path.basename(file)]}, []}},
      proxy_headers(conn, url),
      proxy_opts(opts)
    )
    |> ReverseProxyPlug.response(conn, opts)
  end

  def delete(conn, %{"repo" => repo, "chart" => chart, "version" => v}) do
    url = Path.join([chartmuseum(), "cm", "api", repo, "charts", chart, v])

    execute_proxy(:delete, url, conn)
  end

  def list(conn, %{"repo" => repo}) do
    url = Path.join([chartmuseum(), "cm", "api", repo, "charts"])

    execute_proxy(:get, url, conn)
  end

  def list_versions(conn, %{"repo" => repo, "chart" => chart}) do
    url = Path.join([chartmuseum(), "cm", "api", repo, "charts", chart])

    execute_proxy(:get, url, conn)
  end

  def get_version(conn, %{"repo" => repo, "chart" => chart, "version" => version}) do
    url = Path.join([chartmuseum(), "cm", "api", repo, "charts", chart, version])

    execute_proxy(:get, url, conn)
  end

  def fetch_repository(%{params: %{"repo" => repo_name}} = conn, _) do
    repo = Repositories.get_repository_by_name!(repo_name)
    assign(conn, :repo, repo)
  end

  def authorize(conn, _) do
    current_user = Guardian.Plug.current_resource(conn)
    case RepoPolicy.allow(conn.assigns.repo, current_user, :access) do
      {:ok, _} -> conn
      _ ->
        ApiWeb.FallbackController.call(conn, {:error, :forbidden})
        |> halt()
    end
  end

  defp chartmuseum(), do: Application.get_env(:core, :chartmuseum)
end