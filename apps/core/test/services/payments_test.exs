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
      [create: fn %{id: _, amount: 100, currency: "USD", interval: "month", product: %{name: "pro"}},
                  [connect_account: "account_id"] ->
        {:ok, %{}}
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
    end

    test_with_mock "It non owners cannot create plans", Stripe.Plan,
      [create: fn %{id: _, amount: 100, currency: "USD", interval: "month", product: %{name: "pro"}},
                  [connect_account: "account_id"] ->
        {:ok, %{}}
      end] do
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
      %{id: plan_id} = plan = insert(:plan, repository: installation.repository)

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
          items: [%{plan: ^plan_id}]
        }, [connect_account: "account_id"] ->
          {:ok, %{id: "sub_id"}}
        end]}
      ] do
        {:ok, subscription} = Payments.create_subscription(plan, installation, user)

        assert subscription.installation_id == installation.id
        assert subscription.plan_id == plan.id
        assert subscription.customer_id == "cus_id2"
        assert subscription.external_id == "sub_id"
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