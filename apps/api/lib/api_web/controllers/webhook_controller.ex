defmodule ApiWeb.WebhookController do
  use ApiWeb, :controller
  alias Core.WorkOS.{Event, Handler}

  plug :workos_verify when action == :workos

  def workos(conn, params) do
    Event.parse(params)
    |> Handler.handle()

    json(conn, %{ok: true})
  end

  defp workos_verify(conn, _) do
    secret = Core.conf(:workos_webhook)
    with %{raw_body: payload} <- conn.assigns,
         [signature | _] <- get_req_header(conn, "workos-signature"),
         ["t=" <> ts, "v1=" <> sig] <- String.split(signature, ", "),
         computed <- Api.hmac(secret, "#{ts}.#{payload}"),
         true <- Plug.Crypto.secure_compare(computed, sig) do
      conn
    else
      _ ->
        send_resp(conn, 403, "Forbidden")
        |> halt()
    end
  end
end
