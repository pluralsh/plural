defmodule GraphQl.PaymentsQueriesTest do
  use Core.SchemaCase, async: true
  use Mimic
  import GraphQl.TestHelpers

  describe "subscriptions" do
    test "It will list subscriptions for a user" do
      user = insert(:user)
      subscriptions = for _ <- 1..3,
        do: insert(:subscription, installation: build(:installation, user: user))

      {:ok, %{data: %{"subscriptions" => found}}} = run_query("""
        query {
          subscriptions(first: 5) {
            edges {
              node { id }
            }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(subscriptions)
    end
  end

  describe "repositorySubscription" do
    test "It can query a user's subscription" do
      user = insert(:user)
      repo = insert(:repository)
      installation = insert(:installation, repository: repo, user: user)
      subscription = insert(:subscription, installation: installation, plan: insert(:plan, repository: repo))

      {:ok, %{data: %{"repositorySubscription" => found}}} = run_query("""
        query Subscription($id: ID!) {
          repositorySubscription(id: $id) {
            id
          }
        }
      """, %{"id" => subscription.id}, %{current_user: user})

      assert found["id"] == subscription.id
    end

    test "It can query a user's subscription and invoices" do
      user      = insert(:user)
      publisher = insert(:publisher, billing_account_id: "act_id")
      repo      = insert(:repository, publisher: publisher)
      installation = insert(:installation, repository: repo, user: user)
      subscription = insert(:subscription,
        customer_id: "cus_id",
        installation: installation,
        plan: insert(:plan, repository: repo)
      )
      expect(Stripe.Invoice, :list, fn %{customer: "cus_id"}, [connect_account: "act_id"] ->
        {:ok, mk_invoices()}
      end)

      {:ok, %{data: %{"repositorySubscription" => found}}} = run_query("""
        query Subscription($id: ID!) {
          repositorySubscription(id: $id) {
            id
            invoices(first: 5) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  number
                  amountDue
                  amountPaid
                  currency
                  lines {
                    amount
                    currency
                    description
                  }
                }
              }
            }
          }
        }
      """, %{"id" => subscription.id}, %{current_user: user})

      assert found["id"] == subscription.id
      %{"pageInfo" => pageInfo, "edges" => [first, second]} = found["invoices"]
      assert pageInfo["hasNextPage"]
      assert pageInfo["endCursor"] == "stripe-id-2"

      expected_line_item = %{"amount" => 10, "currency" => "usd", "description" => "Some line item"}
      assert first["node"]["number"] == "some-number"
      assert first["node"]["amountDue"] == 0
      assert first["node"]["amountPaid"] == 10
      assert first["node"]["currency"] == "usd"
      assert Enum.all?(first["node"]["lines"], & &1 == expected_line_item)

      assert second["node"]["number"] == "some-number"
      assert second["node"]["amountDue"] == 10
      assert second["node"]["amountPaid"] == 10
      assert second["node"]["currency"] == "usd"
      assert Enum.all?(second["node"]["lines"], & &1 == expected_line_item)
    end
  end

  describe "cards" do
    test "You can query your own cards on your user" do
      user = insert(:user, account: build(:account, billing_customer_id: "cus_id"))
      expect(Stripe.Card, :list, fn %{customer: "cus_id"} -> {:ok, mk_cards()} end)

      {:ok, %{data: %{"me" => me}}} = run_query("""
        query {
          me {
            cards(first: 5) {
              edges {
                node {
                  id
                  brand
                  last4
                }
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      cards = from_connection(me["cards"])
      assert length(cards) == 2
      assert Enum.all?(cards, & &1["id"] == "some_id")
      assert Enum.all?(cards, & &1["brand"] == "amex")
      assert Enum.all?(cards, & &1["last4"] == "0123")
    end
  end

  describe "platformPlans" do
    test "it will list visible platform plans" do
      plans = insert_list(3, :platform_plan)
      insert(:platform_plan, visible: false)

      {:ok, %{data: %{"platformPlans" => found}}} = run_query("""
        query {
          platformPlans { id }
        }
      """, %{}, %{current_user: insert(:user)})

      assert ids_equal(found, plans)
    end
  end

  describe "platformSubscription" do
    test "it will fetch the subscription for your account" do
      user = insert(:user)
      sub = insert(:platform_subscription, account: user.account)

      {:ok, %{data: %{"platformSubscription" => found}}} = run_query("""
        query {
          platformSubscription { id }
        }
      """, %{}, %{current_user: user})

      assert found["id"] == sub.id
    end
  end

  defp mk_invoices() do
    %Stripe.List{
      has_more: true,
      data: [
        %Stripe.Invoice{
          id: "stripe-id-1",
          number: "some-number",
          amount_due: 0,
          amount_paid: 10,
          currency: "usd",
          lines: mk_invoice_items()
        },
        %Stripe.Invoice{
          id: "stripe-id-2",
          number: "some-number",
          amount_due: 10,
          amount_paid: 10,
          currency: "usd",
          lines: mk_invoice_items()
        }
      ]
    }
  end

  defp mk_cards() do
    %Stripe.List{
      has_more: true,
      data: [
        %Stripe.Card{
          id: "some_id",
          brand: "amex",
          last4: "0123",
          exp_month: 1,
          exp_year: 2020,
          name: "Someone"
        },
        %Stripe.Card{
          id: "some_id",
          brand: "amex",
          last4: "0123",
          exp_month: 1,
          exp_year: 2020,
          name: "Someone"
        }
      ]
    }
  end

  defp mk_invoice_items() do
    %Stripe.List{
      has_more: false,
      data: [
        %Stripe.LineItem{
          amount: 10,
          currency: "usd",
          description: "Some line item"
        },
        %Stripe.LineItem{
          amount: 10,
          currency: "usd",
          description: "Some line item"
        }
      ]
    }
  end
end
