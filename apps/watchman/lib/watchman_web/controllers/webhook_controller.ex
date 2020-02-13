defmodule WatchmanWeb.WebhookController do
  use WatchmanWeb, :controller
  alias Watchman.Services.Builds
  plug WatchmanWeb.Verifier

  def webhook(conn, %{"repo" => name}) do
    with {:ok, _} <- Builds.create(%{repository: name}),
      do: json(conn, %{ok: true})
  end
end
