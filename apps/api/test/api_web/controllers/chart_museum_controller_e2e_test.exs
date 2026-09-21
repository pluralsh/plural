defmodule ApiWeb.ChartMuseumControllerE2ETest do
  use ExUnit.Case, async: false

  import Plug.Test

  alias ApiWeb.ChartMuseumController

  setup_all do
    chartmuseum = Application.fetch_env!(:core, :chartmuseum)
    wait_for_chartmuseum!(chartmuseum)

    repo = "proxy-e2e-#{System.unique_integer([:positive])}"
    {archive, chart, version} = chart_archive!(repo)
    upload_chart!(chartmuseum, repo, archive)

    on_exit(fn ->
      HTTPoison.delete(
        Path.join([chartmuseum, "cm", "api", repo, "charts", chart, version])
      )

      File.rm(archive)
    end)

    {:ok, repo: repo, archive: archive, chart: chart, version: version}
  end

  test "proxies a repository index from ChartMuseum", %{
    repo: repo,
    chart: chart,
    version: version
  } do
    conn =
      conn(:get, "/cm/#{repo}/index.yaml")
      |> ChartMuseumController.index(%{"repo" => repo})

    assert conn.status == 200
    assert conn.resp_body =~ "#{chart}:"
    assert conn.resp_body =~ "version: #{version}"
    assert conn.resp_body =~ "charts/#{chart}-#{version}.tgz"
  end

  test "streams a chart archive from ChartMuseum", %{
    repo: repo,
    archive: archive,
    chart: chart,
    version: version
  } do
    filename = "#{chart}-#{version}.tgz"

    conn =
      conn(:get, "/cm/#{repo}/charts/#{filename}")
      |> ChartMuseumController.get(%{"repo" => repo, "chart" => filename})

    assert conn.status == 200
    assert conn.resp_body == File.read!(archive)
  end

  defp chart_archive!(repo) do
    chart_dir = Path.expand("../../../../../plural/helm/plural", __DIR__)
    {:ok, %{"name" => chart, "version" => version}} =
      chart_dir
      |> Path.join("Chart.yaml")
      |> YamlElixir.read_from_file()

    path = Path.join(System.tmp_dir!(), "#{repo}-#{chart}-#{version}.tgz")

    :ok =
      :erl_tar.create(
        String.to_charlist(path),
        chart_entries(chart_dir, chart),
        [:compressed]
      )

    {path, chart, version}
  end

  defp chart_entries(chart_dir, chart) do
    chart_dir
    |> Path.join("**/*")
    |> Path.wildcard(match_dot: true)
    |> Enum.filter(&File.regular?/1)
    |> Enum.map(fn path ->
      archive_path = Path.join(chart, Path.relative_to(path, chart_dir))
      {String.to_charlist(archive_path), File.read!(path)}
    end)
  end

  defp upload_chart!(chartmuseum, repo, archive) do
    upload =
      {:multipart,
       [
         {:file, archive,
          {"form-data", [{"name", "chart"}, {"filename", Path.basename(archive)}]}, []}
       ]}

    url = Path.join([chartmuseum, "cm", "api", repo, "charts"])
    assert {:ok, %HTTPoison.Response{status_code: 201}} = HTTPoison.post(url, upload)
  end

  defp wait_for_chartmuseum!(chartmuseum, attempts \\ 100)

  defp wait_for_chartmuseum!(_chartmuseum, 0) do
    flunk("ChartMuseum did not become ready")
  end

  defp wait_for_chartmuseum!(chartmuseum, attempts) do
    case HTTPoison.get(Path.join([chartmuseum, "cm", "health"])) do
      {:ok, %HTTPoison.Response{status_code: 200}} ->
        :ok

      _ ->
        Process.sleep(100)
        wait_for_chartmuseum!(chartmuseum, attempts - 1)
    end
  end
end
