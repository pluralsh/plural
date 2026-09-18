defmodule ApiWeb.Plugs.ReverseProxyTest do
  use ExUnit.Case, async: true

  import Plug.Conn
  import Plug.Test

  alias ApiWeb.Plugs.ReverseProxy

  describe "request_body/2" do
    test "uses an empty body for a binary chart download GET" do
      conn = conn(:get, "/cm/example/charts/sample-1.0.0.tgz")

      assert ReverseProxy.request_body(:get, conn) == ""
    end

    test "uses an empty body for HEAD requests" do
      conn = conn(:head, "/cm/example/charts/sample-1.0.0.tgz")

      assert ReverseProxy.request_body(:head, conn) == ""
    end

    test "extracts the request body for methods that send one" do
      conn = conn(:delete, "/cm/api/example/charts/sample/1.0.0", "payload")

      assert ReverseProxy.request_body(:delete, conn) == "payload"
    end
  end

  describe "request_url/2" do
    test "preserves upstream and incoming query strings" do
      assert ReverseProxy.request_url(
               "http://chartmuseum:8080/cm/example?existing=value",
               "version=1"
             ) ==
               "http://chartmuseum:8080/cm/example?existing=value&version=1"
    end
  end

  describe "proxy_headers/2" do
    test "forwards end-to-end headers and excludes sensitive and hop-by-hop headers" do
      conn =
        conn(:get, "/cm/example/charts/sample-1.0.0.tgz")
        |> put_req_header("accept", "application/gzip")
        |> put_req_header("authorization", "Bearer token")
        |> put_req_header("connection", "keep-alive")
        |> put_req_header("transfer-encoding", "chunked")

      headers = ReverseProxy.proxy_headers(conn, "http://chartmuseum:8080/cm/example")

      assert {"accept", "application/gzip"} in headers
      assert {"host", "chartmuseum:8080"} in headers

      refute Enum.any?(headers, fn {header, _} ->
               header in ["authorization", "connection", "transfer-encoding"]
             end)
    end
  end

  test "propagates a binary upstream response while excluding hop-by-hop headers" do
    conn = conn(:get, "/cm/example/charts/sample-1.0.0.tgz")
    opts = ReverseProxyPlug.init(response_mode: :buffer, upstream: "http://chartmuseum:8080")

    conn =
      ReverseProxyPlug.response(
        {:ok,
         %{
           status_code: 206,
           headers: [{"content-type", "application/gzip"}, {"connection", "close"}],
           body: <<0, 1, 2, 3>>
         }},
        conn,
        opts
      )

    assert conn.status == 206
    assert conn.resp_body == <<0, 1, 2, 3>>
    assert get_resp_header(conn, "content-type") == ["application/gzip"]
    assert get_resp_header(conn, "connection") == []
  end

  test "returns a safe gateway error for upstream failures" do
    conn = conn(:get, "/cm/example/charts/sample-1.0.0.tgz")
    opts = ReverseProxyPlug.init(upstream: "http://chartmuseum:8080")

    conn =
      ReverseProxyPlug.response(
        {:error, %ReverseProxyPlug.HTTPClient.Error{reason: :econnrefused}},
        conn,
        opts
      )

    assert conn.status == 502
    assert conn.resp_body == ""
  end
end
