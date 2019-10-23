defmodule ApiWeb.Plugs.ReverseProxy do
  @ignore_headers ~w(
    te
    transfer-encoding
    trailer
    connection
    keep-alive
    proxy-authenticate
    proxy-authorization
    upgrade
    authorization
  )

  def execute_proxy(method, url, conn) do
    opts = ReverseProxyPlug.init([])

    HTTPoison.request(%HTTPoison.Request{
      method: method,
      url: url,
      body: ReverseProxyPlug.read_body(conn),
      headers: proxy_headers(conn, url),
      options: proxy_opts(opts)
    })
    |> ReverseProxyPlug.response(conn, opts)
  end

  def proxy_headers(conn, url) do
    %{host: host, port: port} = URI.parse(url)

    conn.req_headers
    |> Enum.map(fn {header, value} -> {String.downcase(header), value} end)
    |> Enum.filter(fn
      {header, _} when header not in @ignore_headers -> true
      _ -> false
    end)
    |> List.keyreplace("host", 0, {"host", "#{host}:#{port}"})
  end

  def proxy_opts(opts) do
    opts
    |> Keyword.put_new(:timeout, :infinity)
    |> Keyword.put_new(:recv_timeout, :infinity)
    |> Keyword.put_new(:stream_to, self())
  end
end