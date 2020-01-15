defmodule Core.Services.PaymentsTest do
  use Core.SchemaCase, async: false
  import Mock
  alias Core.Services.Payments

  describe "#create_publisher_account" do
    test_with_mock "It will fetch an account id and persist it", Stripe.Connect.OAuth,
        [token: fn "oauth_code" -> {:ok, %{stripe_user_id: "account_id"}} end] do
      publisher = insert(:publisher)

      {:ok, updated} = Payments.create_publisher_account(publisher, "oauth_code")

      assert updated.account_id == "account_id"
    end
  end

  describe "#register_customer" do
    test_with_mock "It will create a customer and persist its id", Stripe.Customer,
        [create: fn %{email: _, source: "token"} -> {:ok, %{id: "cus_some_id"}} end] do
      user = insert(:user)
      {:ok, updated} = Payments.register_customer(user, "token")

      assert updated.customer_id == "cus_some_id"
    end
  end

  describe "#create_plan" do
    test_with_mock "It will create a plan for a repository", Stripe.Plan,
      [create: fn %{amount: 100, currency: "USD", interval: "month", product: %{name: "pro"}},
                  [connect_account: "account_id"] ->
        {:ok, %{id: "id_random"}}
      end] do
      %{publisher: pub} = repository = insert(:repository, publisher: build(:publisher, account_id: "account_id"))

      {:ok, plan} = Payments.create_plan(%{
        name: "pro",
        period: :monthly,
        cost: 100
      }, repository, pub.owner)

      assert plan.name == "pro"
      assert plan.period == :monthly
      assert plan.cost == 100
      assert plan.external_id == "id_random"
    end

    test_with_mock "Plans can have line items", Stripe.Plan,
      [create: fn
        %{amount: _, currency: "USD", interval: "month", product: %{name: "pro"}},
                  [connect_account: "account_id"] ->
          {:ok, %{id: "id_pro"}}
        %{amount: _, currency: "USD", interval: "month", product: %{name: "users"}},
          [connect_account: "account_id"] ->
          {:ok, %{id: "id_users"}}
        %{amount: _, currency: "USD", interval: "month", product: %{name: "storage"}},
          [connect_account: "account_id"] ->
          {:ok, %{id: "id_storage"}}
      end] do
      %{publisher: pub} = repository = insert(:repository,
        publisher: build(:publisher, account_id: "account_id")
      )

      {:ok, plan} = Payments.create_plan(%{
        name: "pro",
        period: :monthly,
        cost: 100,
        line_items: %{
          items: [
            %{dimension: "user", name: "users", cost: 100, period: :monthly},
            %{dimension: "storage", name: "storage", cost: 100, period: :monthly},
          ],
          included: [
            %{dimension: "user", quantity: 1},
            %{dimension: "storage", quantity: 1},
          ]
        }
      }, repository, pub.owner)

      assert plan.name == "pro"
      assert plan.period == :monthly
      assert plan.cost == 100
      assert plan.external_id == "id_pro"

      [user, storage] = plan.line_items.items
      assert user.dimension == "user"
      assert user.name == "users"
      assert user.cost == 100
      assert user.period == :monthly
      assert user.external_id == "id_users"

      assert storage.dimension == "storage"
      assert storage.name == "storage"
      assert storage.cost == 100
      assert storage.period == :monthly
      assert storage.external_id == "id_storage"

      [user, storage] = plan.line_items.included
      assert user.dimension == "user"
      assert user.quantity == 1
      assert storage.dimension == "storage"
      assert storage.quantity == 1
    end

    test "Non owners cannot create plans" do
      repository = insert(:repository, publisher: build(:publisher, account_id: "account_id"))

      {:error, _} = Payments.create_plan(%{
        name: "pro",
        period: :monthly,
        cost: 100
      }, repository, insert(:user))
    end
  end

  describe "#create_subscription" do
    test "A user can create a subscription for their installation" do
      user = insert(:user, customer_id: "cus_id")
      repository = insert(:repository, publisher: build(:publisher, account_id: "account_id"))
      installation = insert(:installation, user: user, repository: repository)
      plan = insert(:plan, external_id: "plan_id", repository: installation.repository)

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
          items: [%{plan: "plan_id"}]
        }, [connect_account: "account_id"] ->
          {:ok, %{id: "sub_id", items: %{data: [%{id: "item_id"}]}}}
        end]}
      ] do
        {:ok, subscription} = Payments.create_subscription(plan, installation, user)

        assert subscription.installation_id == installation.id
        assert subscription.plan_id == plan.id
        assert subscription.customer_id == "cus_id2"
        assert subscription.external_id == "sub_id"
        assert subscription.line_items.item_id == "item_id"
      end
    end

    test "It can create a subscription with line items" do
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
        {:ok, subscription} = Payments.create_subscription(%{
          line_items: %{
            items: [
              %{dimension: "storage", quantity: 1},
              %{dimension: "user", quantity: 2}
            ]
          }
        }, plan, installation, user)

        assert subscription.installation_id == installation.id
        assert subscription.plan_id == plan.id
        assert subscription.customer_id == "cus_id2"
        assert subscription.external_id == "sub_id"

        assert subscription.line_items.item_id == "item_id"
        [storage, user] = subscription.line_items.items
        assert storage.dimension == "storage"
        assert storage.quantity == 1
        assert storage.external_id == "stor_id"
        assert user.dimension == "user"
        assert user.quantity == 2
        assert user.external_id == "user_id"
      end
    end

    test "Mismapped plan/installations will fail" do
      plan = insert(:plan)
      %{user: user} = installation = insert(:installation, user: build(:user, customer_id: "cus_id"))

      {:error, :forbidden} = Payments.create_subscription(plan, installation, user)
    end

    test "Users without registered customers will fail" do
      user = insert(:user)
      repository = insert(:repository, publisher: build(:publisher, account_id: "account_id"))
      installation = insert(:installation, user: user, repository: repository)
      plan = insert(:plan, repository: installation.repository)

      {:error, _} = Payments.create_subscription(plan, installation, user)
    end
  end
end