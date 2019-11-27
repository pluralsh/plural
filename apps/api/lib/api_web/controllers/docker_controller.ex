defmodule ApiWeb.DockerController do
  use ApiWeb, :controller
  alias Core.PubSub.{DockerNotification, Broadcaster}

  def events(conn, params) do
    :ok = Broadcaster.notify(%DockerNotification{item: params})

    json(conn, %{ok: true})
  end
end