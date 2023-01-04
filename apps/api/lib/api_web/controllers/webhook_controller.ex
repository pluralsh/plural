defmodule ApiWeb.WebhookController do
  use ApiWeb, :controller
  alias Core.WorkOS.{Event, Handler}

  plug :workos_verify when action == :workos

  def workos(conn, params) do
    Event.parse(params)
    |> Handler.handle()

    json(conn, %{ok: true})
  end

  def stripe(conn, _) do
    secret = Core.conf(:stripe_webhook_secret)
    with [signature] <- get_req_header(conn, "stripe-signature"),
        %{raw_body: payload} <- conn.assigns,
         {:ok, %Stripe.Event{} = event} <- Stripe.Webhook.construct_event(payload, signature, secret),
         :ok <- handle!(Core.Stripe.Handler, event) do
      send_resp(conn, 200, "Webhook received.") |> halt()
    else
      {:handle_error, reason} -> send_resp(conn, 400, reason) |> halt()
      _ -> send_resp(conn, 400, "Bad request.") |> halt()
    end
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

  defp handle!(handler, event) do
    case handler.handle_event(event) do
      :ok -> :ok
      {:ok, _} -> :ok

      {:error, reason} when is_binary(reason) ->
        {:handle_error, reason}

      {:error, reason} when is_atom(reason) ->
        {:handle_error, "#{reason}"}

      :error ->
        {:handle_error, ""}

      resp ->
        raise """
        #{inspect(handler)}.handle_event/1 returned an invalid response. Expected {:ok, term}, :ok, {:error, reason} or :error
        Got: #{inspect(resp)}
        Event data: #{inspect(event)}
        """
    end
  end
end
