defmodule WatchmanWeb.HealthController do
  use WatchmanWeb, :controller

  def health(conn, _params) do
    json(conn, %{ok: true})
  end
end
