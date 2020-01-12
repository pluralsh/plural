defmodule GraphQl.PaymentsMutationsTest do
  use Core.SchemaCase, async: false
  import Mock
  import GraphQl.TestHelpers

  describe "createCustomer" do
    test_with_mock "It will create a customer and persist its id", Stripe.Customer,
        [create: fn %{email: _, source: "token"} -> {:ok, %{id: "cus_id"}} end] do
      user = insert(:user)

      {:ok, %{data: %{"createCustomer" => result}}} = run_query("""
        mutation CreateCustomer($source: String!) {
          createCustomer(source: $source) {
            customerId
          }
        }
      """, %{"source" => "token"}, %{current_user: user})

      assert result["customerId"] == "cus_id"
    end
  end

  describe "linkPublisher" do
    test_with_mock "It will fetch an account id and persist it", Stripe.Connect.OAuth,
        [token: fn "oauth_code" -> {:ok, %{stripe_user_id: "account_id"}} end] do
      publisher = insert(:publisher)

      {:ok, %{data: %{"linkPublisher" => result}}} = run_query("""
        mutation LinkPublisher($token: String!) {
          linkPublisher(token: $token) {
            accountId
          }
        }
      """, %{"token" => "oauth_code"}, %{current_user: publisher.owner})

      assert result["accountId"] == "account_id"
    end
  end

  describe "createPlan" do
    test_with_mock "It will create a plan for a repository", Stripe.Plan,
      [create: fn %{id: _, amount: 100, currency: "USD", interval: "month", product: %{name: "pro"}},
                  [connect_account: "account_id"] ->
        {:ok, %{}}
      end] do
      %{publisher: pub} = repository = insert(:repository,
        publisher: build(:publisher, account_id: "account_id")
      )

      {:ok, %{data: %{"createPlan" => result}}} = run_query("""
        mutation CreatePlan($attributes: PlanAttributes!, $id: ID!) {
          createPlan(attributes: $attributes, repositoryId: $id) {
            id
            name
            period
            cost
          }
        }
      """,
        %{"attributes" => %{"name" => "pro", "period" => "monthly", "cost" => 100}, "id" => repository.id},
        %{current_user: pub.owner})

      assert result["name"] == "pro"
      assert result["period"] == "monthly"
      assert result["cost"] == 100
    end
  end

  describe "createSubscription" do
    test "A user can create a subscription for their installation" do
      user = insert(:user, customer_id: "cus_id")
      repository = insert(:repository, publisher: build(:publisher, account_id: "account_id"))
      installation = insert(:installation, user: user, repository: repository)
      %{id: plan_id} = plan = insert(:plan, repository: installation.repository)

      with_mocks [
        {Stripe.Token, [], [create: fn %{customer: "cus_id"}, [connect_account: "account_id"] ->
          {:ok, %{id: "tok_id"}}
        end]},
        {Stripe.Customer, [], [create: fn %{email: _, source: "tok_id"}, [connect_account: "account_id"] ->
          {:ok, %{id: "cus_id2"}}
        end]},
        {Stripe.Subscription, [], [create: fn %{customer: "cus_id2", items: [%{plan: ^plan_id}]}, [connect_account: "account_id"] ->
          {:ok, %{id: "sub_id"}}
        end]}
      ] do

        {:ok, %{data: %{"createSubscription" => result}}} = run_query("""
          mutation CreateSubscription($planId: String!, $instId: String!) {
            createSubscription(planId: $planId, installationId: $instId) {
              customerId
              externalId
              installation {
                id
              }
              plan {
                id
              }
            }
          }
        """, %{"planId" => plan.id, "instId" => installation.id}, %{current_user: user})

        assert result["installation"]["id"] == installation.id
        assert result["plan"]["id"] == plan.id
        assert result["customerId"] == "cus_id2"
        assert result["externalId"] == "sub_id"
      end
    end
  end
end