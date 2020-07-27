defmodule WatchmanWeb.WebhookController do
  use WatchmanWeb, :controller
  alias Watchman.Services.Builds

  plug WatchmanWeb.Verifier when action == :webhook
  plug WatchmanWeb.PiazzaVerifier when action == :piazza

  def webhook(conn, params) do
    with {:ok, _} <- Builds.create(params),
      do: json(conn, %{ok: true})
  end

  def piazza(conn, %{"text" => "/watchman deploy " <> application}) do
    case Builds.create(%{type: :deploy, repository: application, message: "Deployed from piazza"}) do
      {:ok, _} -> json(conn, %{"text" => "deploying #{application}"})
      _ -> json(conn, %{"text" => "hmm, something went wrong"})
    end
  end
  def piazza(conn, _), do: json(conn, %{"text" => "I don't understand what you're asking"})
end
