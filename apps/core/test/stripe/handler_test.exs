defmodule Core.Stripe.HandlerTest do
  use Core.SchemaCase, async: true
  alias Core.Stripe.Handler

  describe "customer.subscription.created" do
    test "it will persist stripe status" do
      sub = insert(:platform_subscription, external_id: "sub_id")
      event = %Stripe.Event{type: "customer.subscription.created", data: %{object: %Stripe.Subscription{id: "sub_id", status: "active"}}}

      {:ok, updated} = Handler.handle_event(event)

      assert updated.id == sub.id
      assert updated.status == :current
    end
  end

  describe "invoice.payment_succeeded" do
    test "it will mark a delinquent account as undelinquent" do
      account = insert(:account, delinquent_at: Timex.now(), billing_customer_id: "cus_id")
      sub = insert(:platform_subscription, account: account)
      event = %Stripe.Event{type: "invoice.payment_succeeded", data: %{object: %Stripe.Invoice{customer: "cus_id"}}}

      {:ok, updated} = Handler.handle_event(event)

      assert updated.id == account.id
      refute updated.delinquent_at
      assert refetch(sub).status == :current
    end
  end

  describe "invoice.payment_failed" do
    test "it will mark an account as delinquent" do
      account = insert(:account, billing_customer_id: "cus_id")
      sub = insert(:platform_subscription, account: account)
      event = %Stripe.Event{type: "invoice.payment_failed", data: %{object: %Stripe.Invoice{customer: "cus_id"}}}

      {:ok, updated} = Handler.handle_event(event)

      assert updated.id == account.id
      assert updated.delinquent_at
      assert refetch(sub).status == :delinquent
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
