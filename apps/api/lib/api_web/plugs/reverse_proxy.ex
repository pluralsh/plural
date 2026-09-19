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
    opts = ReverseProxyPlug.init(upstream: url)

    HTTPoison.request(%HTTPoison.Request{
      method: method,
      url: request_url(url, conn.query_string),
      body: request_body(method, conn),
      headers: proxy_headers(conn, url),
      options: proxy_opts(opts)
    })
    |> response(conn, opts)
  end

  # ReverseProxyPlug's HTTPoison adapter converts an AsyncResponse into an
  # Enumerable stream before handing it to `response/3`. Requests made here
  # bypass that adapter so we need to do the same conversion ourselves.
  def response({:ok, %HTTPoison.AsyncResponse{id: id}}, conn, opts) do
    {:ok, async_response_stream(id)}
    |> ReverseProxyPlug.response(
      conn,
      Keyword.put(opts, :error_callback, &async_error_response/2)
    )
  end

  def response(result, conn, opts), do: ReverseProxyPlug.response(result, conn, opts)

  # HTTPoison expects a body, not the `{body, conn}` tuple returned by
  # ReverseProxyPlug.read_body/1. Reads are intentionally bodyless.
  def request_body(method, _conn) when method in [:get, :head], do: ""

  def request_body(_method, conn) do
    conn
    |> ReverseProxyPlug.read_body()
    |> elem(0)
  end

  def request_url(url, ""), do: url

  def request_url(url, query_string) do
    uri = URI.parse(url)
    query = Enum.reject([uri.query, query_string], &(&1 in [nil, ""])) |> Enum.join("&")

    URI.to_string(%{uri | query: query})
  end

  def proxy_headers(conn, url) do
    %{host: host, port: port} = URI.parse(url)

    conn.req_headers
    |> Enum.map(fn {header, value} -> {String.downcase(header), value} end)
    |> Enum.filter(fn
      {header, _} when header not in @ignore_headers -> true
      _ -> false
    end)
    |> List.keystore("host", 0, {"host", "#{host}:#{port}"})
  end

  def proxy_opts(opts) do
    opts
    |> Keyword.put_new(:timeout, :infinity)
    |> Keyword.put_new(:recv_timeout, :infinity)
    |> Keyword.put_new(:stream_to, self())
  end

  defp async_response_stream(id) do
    Stream.unfold(id, fn id ->
      receive do
        %HTTPoison.AsyncStatus{id: ^id, code: code} ->
          {{:status, code}, id}

        %HTTPoison.AsyncHeaders{id: ^id, headers: headers} ->
          {{:headers, headers}, id}

        %HTTPoison.AsyncChunk{id: ^id, chunk: chunk} ->
          {{:chunk, chunk}, id}

        %HTTPoison.Error{id: ^id, reason: reason} ->
          {{:error, %ReverseProxyPlug.HTTPClient.Error{id: id, reason: reason}}, nil}

        %HTTPoison.AsyncRedirect{id: ^id, to: to} ->
          {{:error, %ReverseProxyPlug.HTTPClient.Error{id: id, reason: {:redirect, to}}}, nil}

        %HTTPoison.AsyncEnd{id: ^id} ->
          nil
      end
    end)
  end

  defp async_error_response(_error, %{state: state} = conn) when state in [:chunked, :sent],
    do: conn

  defp async_error_response(error, conn) do
    status =
      if error.reason in ReverseProxyPlug.get_timeout_error_reasons(),
        do: 504,
        else: 502

    Plug.Conn.send_resp(conn, status, "")
  end
end
