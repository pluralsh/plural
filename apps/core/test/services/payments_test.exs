defmodule Core.Services.PaymentsTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub
  alias Core.Services.Payments

  describe "#create_publisher_account" do
    test "It will fetch an account id and persist it" do
      expect(Stripe.Connect.OAuth, :token, fn "oauth_code" -> {:ok, %{stripe_user_id: "account_id"}} end)
      publisher = insert(:publisher)

      {:ok, updated} = Payments.create_publisher_account(publisher, "oauth_code")

      assert updated.billing_account_id == "account_id"
    end
  end

  describe "#create_card" do
    test "It will create a customer and persist its id" do
      user = insert(:user, account: build(:account, root_user: build(:user)))
      expect(Stripe.Customer, :create, fn %{email: _, source: "token"} -> {:ok, %{id: "cus_some_id"}} end)
      {:ok, updated} = Payments.create_card(user, "token")

      assert updated.billing_customer_id == "cus_some_id"
    end

    test "If a customer has already been registered, it will just create a new card" do
      user = insert(:user, account: build(:account, billing_customer_id: "cus_id"))
      expect(Stripe.Card, :create, fn %{customer: "cus_id", source: "token"} -> {:ok, %{id: "something"}} end)

      {:ok, _} = Payments.create_card(user, "token")
    end
  end

  describe "#delete_card" do
    test "It will delete a customer's card" do
      user = insert(:user, account: build(:account, billing_customer_id: "cus_id"))
      expect(Stripe.Card, :delete, fn "card", %{customer: "cus_id"} -> {:ok, %{id: "bogus"}} end)

      {:ok, updated} = Payments.delete_card("card", user)

      assert updated.id == user.account.id
    end
  end

  describe "#create_platform_plan" do
    test "Plans can have line items" do
      expect(Stripe.Plan, :create, 2, fn
        %{amount: _, currency: "USD", interval: "month", product: %{name: "pro"}} ->
          {:ok, %{id: "id_pro"}}
        %{amount: _, currency: "USD", interval: "month", product: %{name: "users"}} ->
          {:ok, %{id: "id_users"}}
      end)

      {:ok, plan} = Payments.create_platform_plan(%{
        name: "pro",
        period: :monthly,
        cost: 100,
        line_items: [
          %{dimension: "user", name: "users", cost: 100, period: :monthly},
        ]
      })

      assert plan.name == "pro"
      assert plan.period == :monthly
      assert plan.cost == 100
      assert plan.external_id == "id_pro"

      [user] = plan.line_items
      assert user.dimension == :user
      assert user.name == "users"
      assert user.cost == 100
      assert user.period == :monthly
      assert user.external_id == "id_users"
    end
  end

  describe "#create_plan" do
    test "It will create a plan for a repository" do
      expect(Stripe.Plan, :create, fn
        %{amount: 100, currency: "USD", interval: "month", product: %{name: "pro"}},
        [connect_account: "account_id"] ->
        {:ok, %{id: "id_random"}}
      end)

      %{publisher: pub} = repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))

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

    test "Plans can have line items" do
      expect(Stripe.Plan, :create, 3, fn
        %{amount: _, currency: "USD", interval: "month", product: %{name: "pro"}},
            [connect_account: "account_id"] ->
          {:ok, %{id: "id_pro"}}
        %{amount: _, currency: "USD", interval: "month", product: %{name: "users"}},
            [connect_account: "account_id"] ->
          {:ok, %{id: "id_users"}}
        %{amount: _, currency: "USD", interval: "month", product: %{name: "storage"}},
            [connect_account: "account_id"] ->
          {:ok, %{id: "id_storage"}}
      end)
      %{publisher: pub} = repository = insert(:repository,
        publisher: build(:publisher, billing_account_id: "account_id")
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
      repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))

      {:error, _} = Payments.create_plan(%{
        name: "pro",
        period: :monthly,
        cost: 100
      }, repository, insert(:user))
    end
  end

  describe "#update_plan_attributes" do
    test "publishers can update SLAs for a plan" do
      %{publisher: pub} = repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))
      plan = insert(:plan, repository: repository)

      {:ok, plan} = Payments.update_plan_attributes(%{
        service_levels: [
          %{min_severity: 0, max_severity: 3, response_time: 30},
          %{min_severity: 4, max_severity: 5, response_time: 120}
        ]
      }, plan.id, pub.owner)

      [first, second] = plan.service_levels
      assert first.min_severity == 0
      assert first.max_severity == 3
      assert first.response_time == 30

      assert second.min_severity == 4
      assert second.max_severity == 5
      assert second.response_time == 120
    end
  end

  describe "#create_platform_susbcription" do
    test "A user can create a subscription for a platform plan" do
      account = insert(:account, billing_customer_id: "cus_id")
      user = insert(:user, roles: %{admin: true}, account: account)
      plan = insert(:platform_plan,
        external_id: "plan_id",
        line_items: [
          %{name: "user", dimension: :user, external_id: "id_user", period: :monthly},
        ]
      )

      expect(Stripe.Subscription, :create, fn %{
        customer: "cus_id",
        items: [%{plan: "id_user", quantity: 2}]
      } ->
        {:ok, %{
          id: "sub_id",
          items: %{
            data: [%{id: "user_id", plan: %{id: "id_user"}}]
          }
        }}
      end)

      {:ok, subscription} = Payments.create_platform_subscription(%{
        line_items: [
          %{dimension: "user", quantity: 2}
        ]
      }, plan, user)

      assert subscription.plan_id == plan.id
      assert subscription.account_id == user.account_id
      assert subscription.external_id == "sub_id"

      [user] = subscription.line_items
      assert user.id
      assert user.dimension == :user
      assert user.quantity == 2
      assert user.external_id == "user_id"
    end
  end

  describe "#create_subscription" do
    test "A user can create a subscription for their installation" do
      user = insert(:user, customer_id: "cus_id")
      repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))
      installation = insert(:installation, user: user, repository: repository)
      plan = insert(:plan, external_id: "plan_id", repository: installation.repository)

      expect(Stripe.Token, :create, fn %{customer: "cus_id"}, [connect_account: "account_id"] ->
        {:ok, %{id: "tok_id"}}
      end)
      expect(Stripe.Customer, :create, fn %{email: _, source: "tok_id"}, [connect_account: "account_id"] ->
        {:ok, %{id: "cus_id2"}}
      end)
      expect(Stripe.Subscription, :create, fn %{
        customer: "cus_id2",
        application_fee_percent: 5,
        items: [%{plan: "plan_id"}]
      }, [connect_account: "account_id"] ->
        {:ok, %{id: "sub_id", items: %{data: [%{id: "item_id"}]}}}
      end)
      {:ok, subscription} = Payments.create_subscription(plan, installation, user)

      assert subscription.installation_id == installation.id
      assert subscription.plan_id == plan.id
      assert subscription.customer_id == "cus_id2"
      assert subscription.external_id == "sub_id"
      assert subscription.line_items.item_id == "item_id"

      assert_receive {:event, %PubSub.SubscriptionCreated{item: ^subscription}}
    end

    test "It can create a subscription with line items" do
      user = insert(:user, customer_id: "cus_id")
      repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))
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
      expect(Stripe.Token, :create, fn %{customer: "cus_id"}, [connect_account: "account_id"] ->
        {:ok, %{id: "tok_id"}}
      end)
      expect(Stripe.Customer, :create, fn %{email: _, source: "tok_id"}, [connect_account: "account_id"] ->
        {:ok, %{id: "cus_id2"}}
      end)
      expect(Stripe.Subscription, :create, fn %{
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
      end)

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

    test "Mismapped plan/installations will fail" do
      plan = insert(:plan)
      %{user: user} = installation = insert(:installation, user: build(:user, customer_id: "cus_id"))

      {:error, :forbidden} = Payments.create_subscription(plan, installation, user)
    end

    test "Users without registered customers will fail" do
      user = insert(:user)
      repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))
      installation = insert(:installation, user: user, repository: repository)
      plan = insert(:plan, repository: installation.repository)

      {:error, _} = Payments.create_subscription(plan, installation, user)
    end
  end

  describe "#add_usage_record/3" do
    test "It can add a usage record for a subscription" do
      expect(Stripe.SubscriptionItem.Usage, :create, fn "si_id", %{quantity: 1, action: :set, timestamp: _}, [connect_account: "account_id"] ->
        {:ok, %{}}
      end)
      user = insert(:user)
      repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))
      installation = insert(:installation, user: user, repository: repository)
      plan = insert(:plan,
        repository: installation.repository,
        external_id: "plan_id",
        line_items: %{items: [%{name: "mem", dimension: "memory", external_id: "id_stor", period: :monthly, type: :metered}]}
      )
      subscription = insert(:subscription, installation: installation, plan: plan, line_items: %{
        item_id: "some_id",
        items: [%{id: Ecto.UUID.generate(), external_id: "si_id", quantity: 1, dimension: "memory", type: :metered}]
      })

      {:ok, sub} = Payments.add_usage_record(%{quantity: 1}, "memory", subscription)

      assert subscription.id == sub.id
    end
  end

  describe "#update_line_item/3" do
    test "A subscriber can update individual line items" do
      expect(Stripe.SubscriptionItem, :update, fn "si_id", %{quantity: 2}, [connect_account: "account_id"] ->
        {:ok, %{}}
      end)
      user = insert(:user)
      repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))
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

      assert_receive {:event, %PubSub.SubscriptionUpdated{item: ^subscription}}

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
      repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))
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

  describe "#cancel_platform_subscription/2" do
    test "it can delete the subscription in db + stripe" do
      account = insert(:account)
      user = insert(:user, account: account, roles: %{admin: true})
      sub = insert(:platform_subscription, account: account, external_id: "sub_id")
      expect(Stripe.Subscription, :delete, fn "sub_id" -> {:ok, %{}} end)

      {:ok, s} = Payments.cancel_platform_subscription(user)

      assert s.id == sub.id
    end
  end

  describe "#update_platform_plan/3" do
    test "users can change platform plans" do
      expect(Stripe.Subscription, :update, fn
        "sub_id",
        %{items: [
          %{id: "si_1", deleted: true},
          %{plan: "id_user", quantity: 1}
        ]} -> {:ok, %{
          id: "sub_id",
          items: %{
            data: [
              %{id: "user_id", plan: %{id: "id_user"}}
            ]
          }
        }}
      end)

      user = insert(:user, roles: %{admin: true})
      plan = insert(:platform_plan,
        external_id: "pl_id2",
        line_items: [
          %{name: "user", dimension: :user, external_id: "id_user", period: :monthly},
        ]
      )

      old_plan = insert(:platform_plan,
        external_id: "pl_id",
        line_items: [
          %{name: "user", dimension: :user, external_id: "it_1", period: :monthly},
        ]
      )

      insert(:platform_subscription,
        external_id: "sub_id",
        account: user.account,
        plan: old_plan,
        line_items: [
          %{id: Ecto.UUID.generate(), external_id: "si_1", quantity: 1, dimension: :user},
        ]
      )

      {:ok, updated} = Payments.update_platform_plan(plan, user)

      assert updated.external_id == "sub_id"
      [%{dimension: :user} = user] = updated.line_items

      assert user.id
      assert user.external_id == "user_id"
      assert user.quantity == 1
    end
  end

  describe "#update_plan/3" do
    test "Users can change plans" do
      expect(Stripe.Subscription, :update, fn
        "sub_id",
        %{items: [
          %{id: "some_id", deleted: true},
          %{id: "si_1", deleted: true},
          %{id: "si_2", deleted: true},
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
      end)

      user = insert(:user)
      repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))
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
            %{id: Ecto.UUID.generate(), external_id: "si_1", quantity: 1, dimension: "storage"},
            %{id: Ecto.UUID.generate(), external_id: "si_2", quantity: 1, dimension: "user"},
          ]
        }
      )

      {:ok, updated} = Payments.update_plan(plan, subscription, user)

      assert_receive {:event, %PubSub.SubscriptionUpdated{item: ^updated}}

      assert updated.external_id == "sub_id"
      assert updated.line_items.item_id == "item_id"
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
      repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))
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
