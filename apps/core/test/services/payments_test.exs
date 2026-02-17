defmodule Core.Services.PaymentsTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub
  alias Core.Services.Payments
  alias Core.Schema.{Group, Role}

  describe "#create_publisher_account" do
    test "It will fetch an account id and persist it" do
      expect(Stripe.Connect.OAuth, :token, fn "oauth_code" -> {:ok, %{stripe_user_id: "account_id"}} end)
      publisher = insert(:publisher)

      {:ok, updated} = Payments.create_publisher_account(publisher, "oauth_code")

      assert updated.billing_account_id == "account_id"
    end
  end

  # describe "#create_card" do
  #   test "It will create a customer and persist its id" do
  #     user = insert(:user, account: build(:account, root_user: build(:user), billing_address: %{
  #       line1: "line1",
  #       line2: "line2",
  #       city: "new york",
  #       state: "ny",
  #       country: "us",
  #       zip: "10023",
  #       name: "me"
  #     }))

  #     me = self()
  #     expect(Stripe.Customer, :create, fn %{email: _, name: name, address: address, source: "token"} ->
  #       send me, {:stripe, address, name}
  #       {:ok, %{id: "cus_some_id"}}
  #     end)

  #     {:ok, updated} = Payments.create_card(user, "token")

  #     assert updated.billing_customer_id == "cus_some_id"

  #     assert_receive {:stripe, address, name}
  #     assert name == "me"
  #     assert address.line1 == updated.billing_address.line1
  #     assert address.line2 == updated.billing_address.line2
  #     assert address.city == updated.billing_address.city
  #     assert address.state == updated.billing_address.state
  #     assert address.country == updated.billing_address.country
  #     assert address.postal_code == updated.billing_address.zip
  #   end

  #   test "it will fail w/o billing address" do
  #     user = insert(:user, account: build(:account, root_user: build(:user)))

  #     {:error, _} = Payments.create_card(user, "token")
  #   end

  #   test "If a customer has already been registered, it will just create a new card" do
  #     user = insert(:user, account: build(:account, billing_customer_id: "cus_id"))
  #     expect(Stripe.Card, :create, fn %{customer: "cus_id", source: "token"} -> {:ok, %{id: "something"}} end)
  #     expect(Stripe.Invoice, :list, fn %{customer: "cus_id"} ->
  #       {:ok, %Stripe.List{data: [
  #         %Stripe.Invoice{id: "inv_id", status: "uncollectible"},
  #         %Stripe.Invoice{id: "inv_id2", status: "paid"},
  #       ]}}
  #     end)
  #     expect(Stripe.Invoice, :pay, fn "inv_id", %{source: "token"} -> {:ok, %{}} end)

  #     {:ok, _} = Payments.create_card(user, "token")
  #   end
  # end

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

  describe "#backfill_plan_features/0" do
    test "it will backfill features for pro plans" do
      plan = insert(:platform_plan, name: "Pro", visible: true, features: %{audits: true})

      Payments.backfill_plan_features()

      plan = refetch(plan)
      for f <- Core.Schema.PlatformPlan.features(),
        do: assert Map.get(plan.features, f)
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
      account = insert(:account, billing_customer_id: "cus_id", user_count: 2, cluster_count: 0)
      user = insert(:user, roles: %{admin: true}, account: account)
      plan = insert(:platform_plan,
        external_id: "plan_id",
        service_plan: "service_plan",
        line_items: [
          %{name: "user", dimension: :user, external_id: "id_user", period: :monthly},
          %{name: "cluster", dimension: :cluster, external_id: "id_cluster", period: :monthly},
        ]
      )

      expect(Stripe.Subscription, :create, fn %{
        customer: "cus_id",
        items: [%{plan: "id_user", quantity: 2}, %{plan: "id_cluster", quantity: 0}, %{plan: "service_plan"}]
      } ->
        {:ok, %{
          id: "sub_id",
          items: %{
            data: [
              %{id: "metered_id", plan: %{id: "service_plan"}},
              %{id: "user_id", plan: %{id: "id_user"}},
              %{id: "cluster_id", plan: %{id: "id_cluster"}}
            ]
          }
        }}
      end)

      {:ok, subscription} = Payments.create_platform_subscription(%{}, plan, user)

      assert subscription.plan_id == plan.id
      assert subscription.metered_id == "metered_id"
      assert subscription.account_id == user.account_id
      assert subscription.external_id == "sub_id"

      %{user: user, cluster: cluster} = Enum.into(subscription.line_items, %{}, & {&1.dimension, &1})
      assert user.id
      assert user.dimension == :user
      assert user.quantity == 2
      assert user.external_id == "user_id"

      assert cluster.id
      assert cluster.dimension == :cluster
      assert cluster.quantity == 0
      assert cluster.external_id == "cluster_id"

      assert_receive {:event, %PubSub.PlatformSubscriptionCreated{item: ^subscription}}
    end

    test "A user can create a subscription for a platform plan even if on a trial" do
      account = insert(:account, billing_customer_id: "cus_id", user_count: 2, cluster_count: 0)
      sub = insert(:platform_subscription, account: account, plan: trial_plan())
      user = insert(:user, roles: %{admin: true}, account: account)
      plan = insert(:platform_plan,
        external_id: "plan_id",
        line_items: [
          %{name: "user", dimension: :user, external_id: "id_user", period: :monthly},
          %{name: "cluster", dimension: :cluster, external_id: "id_cluster", period: :monthly},
        ]
      )

      expect(Stripe.Subscription, :create, fn %{
        customer: "cus_id",
        items: [%{plan: "id_user", quantity: 2}, %{plan: "id_cluster", quantity: 0}]
      } ->
        {:ok, %{
          id: "sub_id",
          items: %{
            data: [
              %{id: "user_id", plan: %{id: "id_user"}},
              %{id: "cluster_id", plan: %{id: "id_cluster"}}
            ]
          }
        }}
      end)

      {:ok, subscription} = Payments.create_platform_subscription(%{}, plan, user)

      refute subscription.id == sub.id
      assert subscription.account_id == account.id

      refute refetch(sub)
    end

    test "It can autoprovision stripe customers" do
      account = insert(:account, user_count: 2, cluster_count: 0, root_user: build(:user))
      user = insert(:user, roles: %{admin: true}, account: account)
      plan = insert(:platform_plan,
        external_id: "plan_id",
        line_items: [
          %{name: "user", dimension: :user, external_id: "id_user", period: :monthly},
          %{name: "cluster", dimension: :cluster, external_id: "id_cluster", period: :monthly},
        ]
      )

      expect(Stripe.Customer, :create, fn _ -> {:ok, %Stripe.Customer{id: "cus_id"}} end)
      expect(Stripe.Subscription, :create, fn %{
        customer: "cus_id",
        items: [%{plan: "id_user", quantity: 2}, %{plan: "id_cluster", quantity: 0}]
      } ->
        {:ok, %{
          id: "sub_id",
          items: %{
            data: [
              %{id: "user_id", plan: %{id: "id_user"}},
              %{id: "cluster_id", plan: %{id: "id_cluster"}}
            ]
          }
        }}
      end)

      {:ok, subscription} = Payments.create_platform_subscription(%{billing_address: %{
        line1: "blah",
        line2: "blah",
        city:  "blah",
        state: "blah",
        country: "blah",
        zip:   "blah",
      }}, plan, user)

      assert refetch(account).billing_customer_id == "cus_id"
      assert subscription.plan_id == plan.id
      assert subscription.account_id == user.account_id
      assert subscription.external_id == "sub_id"

      %{user: user, cluster: cluster} = Enum.into(subscription.line_items, %{}, & {&1.dimension, &1})
      assert user.id
      assert user.dimension == :user
      assert user.quantity == 2
      assert user.external_id == "user_id"

      assert cluster.id
      assert cluster.dimension == :cluster
      assert cluster.quantity == 0
      assert cluster.external_id == "cluster_id"
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
      expect(Stripe.Subscription, :cancel, fn "sub_id" -> {:ok, %{}} end)

      {:ok, s} = Payments.cancel_platform_subscription(user)

      assert s.id == sub.id
    end
  end

  describe "#create_trial_plan/0" do
    test "it can create a trial pro-type plan" do
      {:ok, plan} = Payments.create_trial_plan()

      assert plan.trial
      refute plan.enterprise
      for f <- ~w(audit multi_cluster user_management vpn)a,
        do: assert Map.get(plan.features, f)
    end
  end

  describe "#sync_usage/1" do
    setup [:setup_root_user]
    test "if the account is on no plan, it'll just de-mark" do
      account = insert(:account, usage_updated: true)

      {:ok, up} = Payments.sync_usage(account)

      assert up.id == account.id
      refute up.usage_updated
    end

    test "if the account is on a platform plan, it will update", %{account: account} do
      {:ok, account} = Ecto.Changeset.change(account, %{cluster_count: 2, user_count: 3})
                       |> Core.Repo.update()
      subscription = insert(:platform_subscription, external_id: "ext_id", account: account, line_items: [
        %{id: Ecto.UUID.generate(), external_id: "si_1", quantity: 1, dimension: :user},
        %{id: Ecto.UUID.generate(), external_id: "si_2", quantity: 0, dimension: :cluster},
      ])

      expect(Stripe.SubscriptionItem, :update, 2, fn
        "si_1", %{quantity: 3} -> {:ok, %{}}
        "si_2", %{quantity: 2} -> {:ok, %{}}
      end)

      {:ok, updated} = Payments.sync_usage(account)

      assert updated.id == subscription.id

      %{user: user, cluster: cluster} = Enum.into(updated.line_items, %{}, & {&1.dimension, &1})

      assert user.quantity == 3
      assert cluster.quantity == 2
    end
  end

  describe "#update_platform_plan/3" do
    test "users can change platform plans" do
      expect(Stripe.Subscription, :update, fn
        "sub_id",
        %{items: [
          %{id: "si_1", deleted: true},
          %{plan: "id_user", quantity: 1},
          %{plan: "service_plan"}
        ]} -> {:ok, %{
          id: "sub_id",
          items: %{
            data: [
              %{id: "metered_id", plan: %{id: "service_plan"}},
              %{id: "user_id", plan: %{id: "id_user"}}
            ]
          }
        }}
      end)

      user = insert(:user, roles: %{admin: true})
      plan = insert(:platform_plan,
        external_id: "pl_id2",
        service_plan: "service_plan",
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
      assert updated.metered_id == "metered_id"

      [%{dimension: :user} = user] = updated.line_items

      assert user.id
      assert user.external_id == "user_id"
      assert user.quantity == 1
    end
  end

  describe "#has_feature?/2" do
    test "if a user's plan has a feature, then it returns true" do
      account = insert(:account)
      enable_features(account, [:user_management])
      user = insert(:user, account: account)
      assert Payments.has_feature?(user, :user_management)
    end

    test "if a user's plan is enterprise, it get's any feature" do
      account = insert(:account)
      insert(:platform_subscription, account: account, plan: build(:platform_plan, enterprise: true, features: %{user_management: false}))
      user = insert(:user, account: account)
      assert Payments.has_feature?(user, :user_management)
    end

    test "if a user's account is grandfathered, then it returns true" do
      account = insert(:account, grandfathered_until: Timex.now() |> Timex.shift(days: 1))
      insert(:platform_subscription, account: account, plan: build(:platform_plan, features: %{user_management: false}))
      user = insert(:user, account: account)
      assert Payments.has_feature?(user, :user_management)

      account = insert(:account, grandfathered_until: Timex.now() |> Timex.shift(days: -1))
      insert(:platform_subscription, account: account, plan: build(:platform_plan, features: %{user_management: false}))
      user = insert(:user, account: account)
      refute Payments.has_feature?(user, :user_management)
    end

    test "if a user's account is delinquent then it returns false" do
      account = insert(:account, delinquent_at: Timex.now() |> Timex.shift(days: -100))
      insert(:platform_subscription, account: account, plan: build(:platform_plan, features: %{user_management: true}))
      user = insert(:user, account: account)
      refute Payments.has_feature?(user, :user_management)

      account = insert(:account, delinquent_at: Timex.now())
      insert(:platform_subscription, account: account, plan: build(:platform_plan, features: %{user_management: true}))
      user = insert(:user, account: account)
      assert Payments.has_feature?(user, :user_management)
    end

    test "if a user's account has no plan it returns false" do
      account = insert(:account)
      user = insert(:user, account: account)
      refute Payments.has_feature?(user, :user_management)
    end

    test "if a user's account is doesn't have the feature, then it returns false" do
      account = insert(:account)
      insert(:platform_subscription, account: account, plan: build(:platform_plan, features: %{user_management: false}))
      user = insert(:user, account: account)
      refute Payments.has_feature?(user, :user_management)
    end
  end

  describe "#delete_platform_subscription/1" do
    setup [:setup_root_user]

    test "it will delete in stripe and db", %{user: user, account: account} do
      sub = insert(:platform_subscription, account: account, external_id: "ext_id")
      expect(Stripe.Subscription, :cancel, fn "ext_id" -> {:ok, %{}} end)

      {:ok, deleted} = Payments.delete_platform_subscription(user)

      assert deleted.id == account.id
      refute deleted.subscription

      refute refetch(sub)
    end

    test "you cannot delete enterprise subscriptions", %{user: user, account: account} do
      insert(:platform_subscription, account: account, external_id: "ext_id", plan: build(:platform_plan, enterprise: true))

      {:error, "to remove an enterprise" <> _} = Payments.delete_platform_subscription(user)
    end

    test "users w/o perms cannot delete", %{account: account} do
      insert(:platform_subscription, account: account, external_id: "ext_id")
      user = insert(:user, account: account)

      {:error, _} = Payments.delete_platform_subscription(user)
    end
  end

  describe "#delete_payment_method/2" do
    test "it can detach a payment method from the customer" do
      account = insert(:account, billing_customer_id: "cus_id")
      user = admin_user(account)
      expect(Stripe.PaymentMethod, :detach, fn %{payment_method: "card"} -> {:ok, %Stripe.PaymentMethod{id: "card"}} end)

      {:ok, _} = Payments.delete_payment_method("card", user)
    end

    test "non admins cannot delete" do
      account = insert(:account, billing_customer_id: "cus_id")
      user    = insert(:user, account: account)

      {:error, _} = Payments.delete_payment_method("card", user)
    end
  end

  describe "#default_payment_method/2" do
    test "it can detach a payment method from the customer" do
      account = insert(:account, billing_customer_id: "cus_id")
      user = admin_user(account)
      expect(Stripe.Customer, :update, fn "cus_id", %{invoice_settings: %{default_payment_method: "card"}} ->
        {:ok, %Stripe.Customer{id: "cus_id"}}
      end)

      {:ok, _} = Payments.default_payment_method(user, "card")
    end

    test "non admins cannot delete" do
      account = insert(:account, billing_customer_id: "cus_id")
      user    = insert(:user, account: account)

      {:error, _} = Payments.default_payment_method(user, "card")
    end
  end

  describe "#limited?/2" do
    test "users under the limit are not limited" do
      account = insert(:account)
      user = insert(:user, account: account)

      refute Payments.limited?(user, :user)
    end

    test "users over the limit w/o a subscription are limited" do
      account = insert(:account, user_count: 5)
      user = insert(:user, account: account)

      assert Payments.limited?(user, :user)
    end

    test "users with a subscription over the limit are not limited" do
      account = insert(:account, user_count: 5)
      insert(:platform_subscription, account: account)
      user = insert(:user, account: account)

      refute Payments.limited?(user, :user)
    end

    test "grandfathered users are not limited" do
      account = insert(:account, user_count: 5, grandfathered_until: Timex.now() |> Timex.shift(hours: 1))
      user = insert(:user, account: account)

      refute Payments.limited?(user, :user)
    end

    test "delinquent users are always limited" do
      account = insert(:account, delinquent_at: Timex.now())
      insert(:platform_subscription, account: account)
      user = insert(:user, account: account)

      assert Payments.limited?(user, :user)
    end
  end

  describe "#setup_enterprise_plan/1" do
    test "will add an account to the current enterprise plan" do
      account = insert(:account)
      plan = insert(:platform_plan, name: "Enterprise")

      {:ok, subscription} = Payments.setup_enterprise_plan(account.id)

      assert subscription.account_id == account.id
      assert subscription.plan_id == plan.id
      refute subscription.external_id
    end

    test "it will set up a plan for a user with a trial" do
      plan = insert(:platform_plan, name: "Enterprise", enterprise: true)
      trial = insert(:platform_plan, name: "Pro Trial", trial: true)
      account = insert(:account)
      insert(:platform_subscription, account: account, plan: trial)
      user = insert(:user, account: account)

      {:ok, subscription} = Payments.setup_enterprise_plan(user)

      assert subscription.account_id == account.id
      assert subscription.plan_id == plan.id
    end
  end

  describe "#begin_trail/1" do
    setup [:setup_root_user, :setup_trial]
    test "it will start a trial plan for a fresh account", %{account: account, plan: trial} do
      {:ok, sub} = Payments.begin_trial(account)

      assert sub.account_id == account.id
      assert sub.plan_id == trial.id

      assert refetch(account).trialed

      assert Group.for_account(account.id)
             |> Core.Repo.aggregate(:count) == 3
      assert Role.for_account(account.id)
             |> Core.Repo.aggregate(:count) == 4
    end

    test "trialed accounts will not be able to trial again" do
      account = insert(:account, trialed: true)

      {:error, _} = Payments.begin_trial(account)
    end
  end

  describe "#migrate_plans/0" do
    test "it can reset the features on nonenterprise plans" do
      enterprise = insert(:platform_plan, enterprise: true)
      self_serve = insert_list(3, :platform_plan)

      {:ok, result} = Payments.migrate_plans()

      refute result[enterprise.id]

      for plan <- self_serve do
        plan = refetch(plan)
        assert Core.Schema.PlatformPlan.features()
              |> Enum.all?(&Map.get(plan.features, &1))
      end
    end
  end

  describe "#expire_trial/1" do
    test "it will remove a trial and clean up cluster dependencies" do
      sub = insert(:platform_subscription)
      user = insert(:user, account: sub.account, upgrade_to: Ecto.UUID.generate())
      deps = for _ <- 1..3, do: insert(:cluster_dependency, cluster: insert(:cluster, owner: user))
      ignore = insert(:user, upgrade_to: Ecto.UUID.generate())
      ignore_deps = for _ <- 1..3, do: insert(:cluster_dependency, cluster: insert(:cluster, owner: ignore))

      {:ok, _} = Payments.expire_trial(sub)

      refute refetch(sub)
      refute refetch(user).upgrade_to
      for dep <- deps,
        do: refute refetch(dep)

      assert refetch(ignore).upgrade_to
      for dep <- ignore_deps,
        do: assert refetch(dep)
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

  describe "#initiate_checkout/1" do
    setup [:setup_root_user]
    test "it will create a checkout session", %{user: user} do
      pro_plan()
      expect(Stripe.Checkout.Session, :create, fn _ ->
        {:ok, %Stripe.Checkout.Session{url: "https://checkout.stripe.com/session_id"}}
      end)

      {:ok, session} = Payments.initiate_checkout(user)

      assert session.url == "https://checkout.stripe.com/session_id"
    end
  end

  describe "#finalize_checkout/2" do
    test "it will finalize a checkout session" do
      account = insert(:account)
      user = insert(:user, account: account)
      plan = pro_plan()
      expect(Stripe.Checkout.Session, :retrieve, fn "session_id" ->
        {:ok, %Stripe.Checkout.Session{customer: "cus_id", subscription: "sub_id"}}
      end)

      {:ok, subscription} = Payments.finalize_checkout("session_id", user)

      assert subscription.account_id == account.id
      assert subscription.external_id == "sub_id"
      assert subscription.plan_id == plan.id
      assert subscription.billing_version == 1

      %{account: account} = Repo.preload(subscription, [:account])

      assert account.billing_customer_id == "cus_id"
    end
  end

  describe "#backfill_subscription/3" do
    test "it will backfill a subscription for a user" do
      account = insert(:account)
      user = insert(:user, account: account)
      plan = pro_plan()

      {:ok, subscription} = Payments.backfill_subscription(user.email, "cus_id", "sub_id")

      assert subscription.account_id == account.id
      assert subscription.external_id == "sub_id"
      assert subscription.plan_id == plan.id
      assert subscription.billing_version == 1

      assert refetch(account).billing_customer_id == "cus_id"
    end
  end
end
