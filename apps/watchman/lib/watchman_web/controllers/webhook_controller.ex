defmodule WatchmanWeb.WebhookController do
  use WatchmanWeb, :controller
  alias Watchman.Services.Builds
  plug WatchmanWeb.Verifier

  def webhook(conn, params) do
    with {:ok, _} <- Builds.create(params),
      do: json(conn, %{ok: true})
  end
end
