defmodule Core.Stripe.Handler do
  @behaviour Stripe.WebhookHandler
  alias Core.Services.Payments

  @sub_events ~w(customer.subscription.created customer.subscription.updated )

  @impl true
  def handle_event(%Stripe.Event{type: e, data: %{object: %Stripe.Subscription{id: id, status: status}}}) when e in @sub_events do
    Payments.update_subscription_status(%{status: to_plural_status(status)}, id)
  end

  def handle_event(%Stripe.Event{type: "invoice.payment_failed", data: %{object: %Stripe.Invoice{customer: id}}}),
    do: Payments.toggle_delinquent(id)

  def handle_event(%Stripe.Event{type: event, data: %{object: %Stripe.Invoice{customer: id}}}) when event in ~w(invoice.payment_succeeded invoice.paid),
    do: Payments.toggle_delinquent(id, nil)

  def handle_event(%Stripe.Event{type: "checkout.session.completed", data: %{object: %Stripe.Checkout.Session{} = session}}),
    do: Payments.finalize_checkout(session)

  def handle_event(_), do: :ok

  defp to_plural_status("active"), do: :current
  defp to_plural_status(s) when s in ~w(incomplete_expired past_due unpaid), do: :delinquent
  defp to_plural_status(_), do: :open
end
