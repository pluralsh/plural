defmodule WatchmanWeb.WebhookController do
  use WatchmanWeb, :controller

  plug WatchmanWeb.Verifier

  def webhook(conn, %{"repo" => name}) do
    with :ok <- Watchman.Deployer.deploy(name),
      do: json(conn, %{ok: true})
  end
end
