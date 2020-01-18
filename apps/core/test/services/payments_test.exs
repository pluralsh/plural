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
        assert storage.id
        assert storage.dimension == "storage"
        assert storage.quantity == 1
        assert storage.external_id == "stor_id"
        assert user.id
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

  describe "#update_line_item/3" do
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
          %{id: Ecto.UUID.generate(), external_id: "si_id2", quantity: 1, dimension: "user"},
        ]
      })

      {:ok, subscription} = Payments.update_line_item(
        %{dimension: "storage", quantity: 2},
        subscription,
        user
      )

      assert subscription.line_items.item_id == "some_id"
      [%{dimension: "storage"} = storage, %{dimension: "user"} = user] = subscription.line_items.items

      assert storage.id
      assert storage.external_id == "si_id"
      assert storage.quantity == 2

      assert user.id
      assert user.external_id == "si_id2"
      assert user.quantity == 1
    end

    test "Users cannot update other user's subscriptions" do
      user = insert(:user)
      repository = insert(:repository, publisher: build(:publisher, account_id: "account_id"))
      installation = insert(:installation, repository: repository)
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
          %{id: Ecto.UUID.generate(), external_id: "si_id2", quantity: 1, dimension: "user"},
        ]
      })

      {:error, :forbidden} = Payments.update_line_item(
        %{dimension: "storage", quantity: 2},
        subscription,
        user
      )
    end
  end

  describe "#update_plan/3" do
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

      {:ok, updated} = Payments.update_plan(plan, subscription, user)

      assert updated.external_id == "sub_id"
      [%{dimension: "storage"} = storage, %{dimension: "user"} = user] = updated.line_items.items

      assert storage.id
      assert storage.external_id == "stor_id"
      assert storage.quantity == 1

      assert user.id
      assert user.external_id == "user_id"
      assert user.quantity == 0
    end

    test "Users cannot change other users' plans" do
      user = insert(:user)
      repository = insert(:repository, publisher: build(:publisher, account_id: "account_id"))
      installation = insert(:installation, repository: repository)
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

      {:error, :forbidden} = Payments.update_plan(plan, subscription, user)
    end
  end
end