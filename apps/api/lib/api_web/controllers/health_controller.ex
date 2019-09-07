defmodule ApiWeb.HealthController do
  use ApiWeb, :controller

  def ping(conn, _params) do
    json(conn, %{pong: true})
  end
end
