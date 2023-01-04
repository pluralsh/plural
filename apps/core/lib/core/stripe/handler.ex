defmodule Core.Stripe.Handler do
  @behaviour Stripe.WebhookHandler
  alias Core.Services.Payments

  @impl true
  def handle_event(%Stripe.Event{type: "invoice.payment_failed", data: %{object: %Stripe.Invoice{customer: id}}}),
    do: Payments.toggle_delinquent(id)

  def handle_event(%Stripe.Event{type: "invoice.payment_succeeded", data: %{object: %Stripe.Invoice{customer: id}}}),
    do: Payments.toggle_delinquent(id, nil)

  def handle_event(_), do: :ok
end
