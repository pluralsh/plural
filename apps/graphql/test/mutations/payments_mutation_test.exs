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
      [create: fn %{amount: 100, currency: "USD", interval: "month", product: %{name: "pro"}},
                  [connect_account: "account_id"] ->
        {:ok, %{id: "id"}}
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
      plan = insert(:plan,
        repository: installation.repository,
        external_id: "plan_id",
        line_items: %{
          items: [
            %{name: "stor", dimension: "storage", external_id: "id_stor", period: :monthly},
            %{name: "user", dimension: "user", external_id: "id_user", period: :monthly},
          ]
        }
      )

      with_mocks [
        {Stripe.Token, [], [create: fn %{customer: "cus_id"}, [connect_account: "account_id"] ->
          {:ok, %{id: "tok_id"}}
        end]},
        {Stripe.Customer, [], [create: fn %{email: _, source: "tok_id"}, [connect_account: "account_id"] ->
          {:ok, %{id: "cus_id2"}}
        end]},
        {Stripe.Subscription, [], [create: fn %{
          customer: "cus_id2",
          application_fee_percent: 5,
          items: [%{plan: "plan_id"}, %{plan: "id_stor", quantity: 1}, %{plan: "id_user", quantity: 2}]
        }, [connect_account: "account_id"] ->
          {:ok, %{
            id: "sub_id",
            items: %{
              data: [
                %{id: "item_id"},
                %{id: "stor_id", plan: %{id: "id_stor"}},
                %{id: "user_id", plan: %{id: "id_user"}}
              ]
            }
          }}
        end]}
      ] do

        {:ok, %{data: %{"createSubscription" => result}}} = run_query("""
          mutation CreateSubscription($planId: String!, $instId: String!, $attrs: SubscriptionAttributes!) {
            createSubscription(planId: $planId, installationId: $instId, attributes: $attrs) {
              customerId
              externalId
              lineItems {
                items {
                  quantity
                  dimension
                }
              }
              installation {
                id
              }
              plan {
                id
              }
            }
          }
        """, %{
          "planId" => plan.id,
          "instId" => installation.id,
          "attrs" => %{
            "line_items" => %{
              "items" => [
                %{"quantity" => 1, "dimension" => "storage"},
                %{"quantity" => 2, "dimension" => "user"}
              ]
            }
          }
        }, %{current_user: user})

        assert result["installation"]["id"] == installation.id
        assert result["plan"]["id"] == plan.id
        assert result["customerId"] == "cus_id2"
        assert result["externalId"] == "sub_id"

        [storage, user] = result["lineItems"]["items"]
        assert storage["quantity"] == 1
        assert storage["dimension"] == "storage"
        assert user["quantity"] == 2
        assert user["dimension"] == "user"
      end
    end
  end

  describe "updateLineItem" do
    test_with_mock "A subscriber can update individual line items", Stripe.SubscriptionItem, [
      update: fn "si_id", %{quantity: 2}, [connect_account: "account_id"] -> {:ok, %{}} end
    ] do
      user = insert(:user)
      repository = insert(:repository, publisher: build(:publisher, account_id: "account_id"))
      installation = insert(:installation, user: user, repository: repository)
      plan = insert(:plan,
        repository: installation.repository,
        external_id: "plan_id",
        line_items: %{
          items: [
            %{name: "stor", dimension: "storage", external_id: "id_stor", period: :monthly},
            %{name: "user", dimension: "user", external_id: "id_user", period: :monthly},
          ]
        })
      subscription = insert(:subscription, installation: installation, plan: plan, line_items: %{
        item_id: "some_id",
        items: [
          %{id: Ecto.UUID.generate(), external_id: "si_id", quantity: 1, dimension: "storage"},
          %{id: Ecto.UUID.generate(), external_id: "si_id2", quantity: 2, dimension: "user"},
        ]
      })

      {:ok, %{data: %{"updateLineItem" => result}}} = run_query("""
          mutation UpdateLineItem($subscriptionId: ID!, $attrs: LimitAttributes!) {
            updateLineItem(subscriptionId: $subscriptionId, attributes: $attrs) {
              lineItems {
                items {
                  quantity
                  dimension
                }
              }
              installation {
                id
              }
              plan {
                id
              }
            }
          }
        """,
        %{"subscriptionId" => subscription.id, "attrs" => %{"dimension" => "storage", "quantity" => 2}},
        %{current_user: user})

      assert result["installation"]["id"] == installation.id
      assert result["plan"]["id"] == plan.id

      [storage, user] = result["lineItems"]["items"]
      assert storage["quantity"] == 2
      assert storage["dimension"] == "storage"
      assert user["quantity"] == 2
      assert user["dimension"] == "user"
    end
  end

  describe "updatePlan" do
    test_with_mock "Users can change plans", Stripe.Subscription, [
      update: fn
        "sub_id",
        %{items: [
          %{plan: "pl_id", deleted: true},
          %{plan: "it_1", deleted: true},
          %{plan: "it_2", deleted: true},
          %{plan: "pl_id2"},
          %{plan: "id_stor", quantity: 1},
          %{plan: "id_user", quantity: 0}
        ]},
        [connect_account: "account_id"] -> {:ok, %{
          id: "sub_id",
          items: %{
            data: [
              %{id: "item_id"},
              %{id: "stor_id", plan: %{id: "id_stor"}},
              %{id: "user_id", plan: %{id: "id_user"}}
            ]
          }
        }}
      end] do
      user = insert(:user)
      repository = insert(:repository, publisher: build(:publisher, account_id: "account_id"))
      installation = insert(:installation, user: user, repository: repository)
      plan = insert(:plan,
        repository: installation.repository,
        external_id: "pl_id2",
        line_items: %{
          included: [%{dimension: "storage", quantity: 1}, %{dimension: "user", quantity: 2}],
          items: [
            %{name: "stor", dimension: "storage", external_id: "id_stor", period: :monthly},
            %{name: "user", dimension: "user", external_id: "id_user", period: :monthly},
          ]
        }
      )

      old_plan = insert(:plan,
        repository: installation.repository,
        external_id: "pl_id",
        line_items: %{
          included: [%{dimension: "storage", quantity: 1}, %{dimension: "user", quantity: 1}],
          items: [
            %{name: "stor", dimension: "storage", external_id: "it_1", period: :monthly},
            %{name: "user", dimension: "user", external_id: "it_2", period: :monthly},
          ]
        }
      )
      subscription = insert(:subscription,
        external_id: "sub_id",
        installation: installation,
        plan: old_plan,
        line_items: %{
          item_id: "some_id",
          items: [
            %{id: Ecto.UUID.generate(), external_id: "it_1", quantity: 1, dimension: "storage"},
            %{id: Ecto.UUID.generate(), external_id: "it_2", quantity: 1, dimension: "user"},
          ]
        }
      )

      {:ok, %{data: %{"updatePlan" => result}}} = run_query("""
          mutation UpdatePlan($subscriptionId: ID!, $planId: ID!) {
            updatePlan(subscriptionId: $subscriptionId, planId: $planId) {
              lineItems {
                items {
                  quantity
                  dimension
                }
              }
              installation {
                id
              }
              plan {
                id
              }
            }
          }
        """,
        %{"subscriptionId" => subscription.id, "planId" => plan.id},
        %{current_user: user})

      assert result["installation"]["id"] == installation.id
      assert result["plan"]["id"] == plan.id

      [storage, user] = result["lineItems"]["items"]
      assert storage["quantity"] == 1
      assert storage["dimension"] == "storage"
      assert user["quantity"] == 0
      assert user["dimension"] == "user"
    end
  end
end