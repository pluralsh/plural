defmodule ApiWeb.ChartMuseumController do
  use ApiWeb, :controller

  def index(conn, %{"publisher" => pub, "repo" => repo}) do
    url = Path.join([chartmuseum(), pub, repo, "index.yaml"]) |> IO.inspect()
    opts = ReverseProxyPlug.init([])

    HTTPoison.request(%HTTPoison.Request{
      method: :get,
      url: url,
      body: ReverseProxyPlug.read_body(conn),
      headers: proxy_headers(conn, url),
      options: proxy_opts(opts)
    })
    |> ReverseProxyPlug.response(conn, opts)
  end

  def get(conn, %{"publisher" => pub, "repo" => repo, "chart" => chart}) do
    url = Path.join([chartmuseum(), pub, repo, "charts", chart])
    opts = ReverseProxyPlug.init([])

    HTTPoison.request(%HTTPoison.Request{
      method: :get,
      url: url,
      body: ReverseProxyPlug.read_body(conn),
      headers: proxy_headers(conn, url),
      options: proxy_opts(opts)
    })
    |> ReverseProxyPlug.response(conn, opts)
  end

  def create_chart(conn, %{"publisher" => pub, "repo" => repo, "chart" => _upload} = params) do
    url = Path.join([chartmuseum(), "api", pub, repo, "charts"])
    opts = ReverseProxyPlug.init(response_mode: :buffer)
    uploads =
      ["chart", "prov"]
      |> Enum.map(&to_upload(params, &1))
      |> Enum.filter(& &1)

    HTTPoison.request(%HTTPoison.Request{
      method: :post,
      url: url,
      body: {:multipart, uploads},
      headers: proxy_headers(conn, url),
      options: [timeout: :infinity, recv_timeout: :infinity] ++ opts
    })
    |> ReverseProxyPlug.response(conn, opts)
  end

  defp to_upload(params, key) do
    case params do
      %{^key => %{filename: file}} ->
        {:file, file, {"form-data", [name: "chart", filename: Path.basename(file)]}, []}
      _ -> nil
    end
  end

  def create_prov(conn, %{"publisher" => pub, "repo" => repo}) do
    url = Path.join([chartmuseum(), "api", pub, repo, "prov"])
    opts = ReverseProxyPlug.init([])

    HTTPoison.request(%HTTPoison.Request{
      method: :post,
      url: url,
      body: ReverseProxyPlug.read_body(conn),
      headers: proxy_headers(conn, url),
      options: proxy_opts(opts)
    })
    |> ReverseProxyPlug.response(conn, opts)
  end

  def delete(conn, %{"publisher" => pub, "repo" => repo, "chart" => chart, "version" => v}) do
    url = Path.join([chartmuseum(), "api", pub, repo, "charts", chart, v])
    opts = ReverseProxyPlug.init([])

    HTTPoison.request(%HTTPoison.Request{
      method: :delete,
      url: url,
      body: ReverseProxyPlug.read_body(conn),
      headers: proxy_headers(conn, url),
      options: proxy_opts(opts)
    })
    |> ReverseProxyPlug.response(conn, opts)
  end

  def list(conn, %{"publisher" => pub, "repo" => repo}) do
    url = Path.join([chartmuseum(), "api", pub, repo, "charts"])
    opts = ReverseProxyPlug.init([])

    HTTPoison.request(%HTTPoison.Request{
      method: :get,
      url: url,
      body: ReverseProxyPlug.read_body(conn),
      headers: proxy_headers(conn, url),
      options: proxy_opts(opts)
    })
    |> ReverseProxyPlug.response(conn, opts)
  end

  def list_versions(conn, %{"publisher" => pub, "repo" => repo, "chart" => chart}) do
    url = Path.join([chartmuseum(), "api", pub, repo, "charts", chart])
    opts = ReverseProxyPlug.init([])

    HTTPoison.request(%HTTPoison.Request{
      method: :get,
      url: url,
      body: ReverseProxyPlug.read_body(conn),
      headers: proxy_headers(conn, url),
      options: proxy_opts(opts)
    })
    |> ReverseProxyPlug.response(conn, opts)
  end

  def get_version(conn, %{"publisher" => pub, "repo" => repo, "chart" => chart, "version" => version}) do
    url = Path.join([chartmuseum(), "api", pub, repo, "charts", chart, version])
    opts = ReverseProxyPlug.init([])

    HTTPoison.request(%HTTPoison.Request{
      method: :get,
      url: url,
      body: ReverseProxyPlug.read_body(conn),
      headers: proxy_headers(conn, url),
      options: proxy_opts(opts)
    })
    |> ReverseProxyPlug.response(conn, opts)
  end

  @ignore_headers ~w(
    te
    transfer-encoding
    trailer
    connection
    keep-alive
    proxy-authenticate
    proxy-authorization
    upgrade
  )

  defp chartmuseum(), do: Application.get_env(:api, :chartmuseum)

  defp proxy_headers(conn, url) do
    %{host: host, port: port} = URI.parse(url)

    conn.req_headers
    |> Enum.map(fn {header, value} -> {String.downcase(header), value} end)
    |> Enum.filter(fn
      {header, _} when header not in @ignore_headers -> true
      _ -> false
    end)
    |> List.keyreplace("host", 0, {"host", "#{host}:#{port}"})
  end

  defp proxy_opts(opts) do
    opts
    |> Keyword.put_new(:timeout, :infinity)
    |> Keyword.put_new(:recv_timeout, :infinity)
    |> Keyword.put_new(:stream_to, self())
  end
end