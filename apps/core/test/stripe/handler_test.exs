defmodule Core.Stripe.HandlerTest do
  use Core.SchemaCase, async: true
  alias Core.Stripe.Handler

  describe "invoice.payment_succeeded" do
    test "it will mark a delinquent account as undelinquent" do
      account = insert(:account, delinquent_at: Timex.now(), billing_customer_id: "cus_id")
      event = %Stripe.Event{type: "invoice.payment_succeeded", data: %{object: %Stripe.Invoice{customer: "cus_id"}}}

      {:ok, updated} = Handler.handle_event(event)

      assert updated.id == account.id
      refute updated.delinquent_at
    end
  end

  describe "invoice.payment_failed" do
    test "it will mark an account as delinquent" do
      account = insert(:account, billing_customer_id: "cus_id")
      event = %Stripe.Event{type: "invoice.payment_failed", data: %{object: %Stripe.Invoice{customer: "cus_id"}}}

      {:ok, updated} = Handler.handle_event(event)

      assert updated.id == account.id
      assert updated.delinquent_at
    end

    test "it will ignore already delinquent accounts" do
      account = insert(:account, delinquent_at: Timex.now(), billing_customer_id: "cus_id")
      event = %Stripe.Event{type: "invoice.payment_failed", data: %{object: %Stripe.Invoice{customer: "cus_id"}}}

      {:ok, updated} = Handler.handle_event(event)

      assert updated.id == account.id
      assert updated.delinquent_at == account.delinquent_at
    end
  end
end
