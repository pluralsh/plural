defmodule RtcWeb.PageControllerTest do
  use RtcWeb.ConnCase

  test "GET /health", %{conn: conn} do
    conn = get(conn, "/health")
    assert json_response(conn, 200)["pong"]
  end

  test "GET /_traffic", %{conn: conn} do
    conn = get(conn, "/__traffic")
    response(conn, 200)
  end
end
