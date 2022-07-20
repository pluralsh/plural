defmodule ApiWeb.HealthControllerTest do
  use ApiWeb.ConnCase, async: true

  test "GET /health", %{conn: conn} do
    conn = get(conn, "/health")
    assert json_response(conn, 200) == %{"pong" => true}
  end

  test "GET /_traffic", %{conn: conn} do
    conn = get(conn, "/__traffic")
    assert response(conn, 200)
  end
end
