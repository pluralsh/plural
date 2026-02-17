defmodule Core.Services.Payments do
  use Core.Services.Base
  import Core.Policies.Payments

  alias Core.PubSub
  alias Core.Services.{Repositories, Accounts, Clusters, Users}
  alias Core.Schema.{
    Publisher,
    Account,
    User,
    Address,
    Repository,
    Plan,
    Subscription,
    Installation,
    PlatformPlan,
    PlatformSubscription
  }

  @user_limit 5

  @type usage_dimension :: :user | :cluster
  @type error :: {:error, term}
  @type plan_resp :: {:ok, Plan.t} | error
  @type platform_plan_resp :: {:ok, PlatformPlan.t} | error
  @type platform_sub_resp :: {:ok, PlatformSubcription.t} | error

  @spec get_account(binary) :: Account.t | nil
  def get_account(cust_id), do: Core.Repo.get_by(Account, billing_customer_id: cust_id)

  @spec get_plan!(binary) :: Plan.t
  def get_plan!(id), do: Core.Repo.get!(Plan, id)

  @spec get_platform_plan!(binary) :: PlatformPlan.t
  def get_platform_plan!(id), do: Core.Repo.get!(PlatformPlan, id)

  @spec get_platform_plan_by_name!(binary) :: PlatformPlan.t
  def get_platform_plan_by_name!(name), do: Core.Repo.get_by!(PlatformPlan, name: name)

  @spec get_platform_plan_by_name(binary) :: PlatformPlan.t
  def get_platform_plan_by_name(name), do: Core.Repo.get_by(PlatformPlan, name: name)

  @spec get_subscription!(binary) :: Subscription.t
  def get_subscription!(id), do: Core.Repo.get!(Subscription, id)

  @spec get_platform_subscription!(binary) :: PlatformSubscription.t
  def get_platform_subscription!(id), do: Core.Repo.get!(PlatformSubscription, id)

  @spec get_platform_subscription_by_account!(binary) :: PlatformSubscription.t
  def get_platform_subscription_by_account!(id), do: Core.Repo.get_by!(PlatformSubscription, account_id: id)

  @spec get_subscription(binary, binary) :: Subscription.t | nil
  def get_subscription(repository_id, user_id) do
    with %Installation{id: id} <- Repositories.get_installation(user_id, repository_id),
      do: Core.Repo.get_by(Subscription, installation_id: id)
  end

  @doc """
  Returns whether the trial plan has been created
  """
  @spec trial_exists?() :: boolean
  def trial_exists?() do
    Core.conf(:trial_plan)
    |> PlatformPlan.for_name()
    |> Core.Repo.exists?()
  end

  def pro_plan!() do
    PlatformPlan.visible()
    |> Core.Repo.get_by!(name: "Pro", period: :monthly)
  end

  @doc """
  Forcibly removes an account from their current trial
  """
  @spec remove_trial(Account.t) :: platform_sub_resp
  def remove_trial(%Account{} = account) do
    case Core.Repo.preload(account, [subscription: :plan], force: true) do
      %Account{subscription: %PlatformSubscription{plan: %PlatformPlan{trial: true}} = sub} ->
        Core.Repo.delete(sub)
      %Account{} -> {:ok, nil}
    end
  end

  @doc """
  Adds the trial plan to a user's account
  """
  @spec begin_trial(User.t | Account.t) :: platform_sub_resp
  def begin_trial(%Account{trialed: true}), do: {:error, "you can only sign up for a free trial once"}
  def begin_trial(%Account{id: aid} = account) do
    %{root_user: root_user} = Core.Repo.preload(account, [:root_user])
    start_transaction()
    |> add_operation(:plan, fn _ ->
      Core.conf(:trial_plan)
      |> get_platform_plan_by_name!()
      |> ok()
    end)
    |> add_operation(:setup, fn %{plan: %{id: id}} ->
      %PlatformSubscription{account_id: aid}
      |> PlatformSubscription.changeset(%{plan_id: id})
      |> Core.Repo.insert()
    end)
    |> add_operation(:trialed, fn _ ->
      Account.changeset(account, %{trialed: true})
      |> Core.Repo.update()
    end)
    |> add_operation(:scaffold, fn _ -> Accounts.account_setup(root_user) end)
    |> execute(extract: :setup)
    |> notify(:create)
  end
  def begin_trial(%User{account_id: aid}) do
    Accounts.get_account!(aid)
    |> begin_trial()
  end

  @doc """
  cleanup related to expiring an active trial
  """
  @spec expire_trial(PlatformSubscription.t) :: platform_sub_resp
  def expire_trial(%PlatformSubscription{account_id: aid} = sub) do
    start_transaction()
    |> add_operation(:promos, fn _ ->
      Core.Services.Clusters.disable_promotions(aid)
    end)
    |> add_operation(:sub, fn _ -> Core.Repo.delete(sub) end)
    |> execute(extract: :sub)
  end

  @doc """
  Determine if a user has access permissions against a subscription
  """
  @spec allow(Subscription.t, User.t) :: {:ok, Subscription.t} | error
  def allow(%Subscription{} = subscription, %User{} = user),
    do: allow(subscription, user, :access)

  def allow_billing(%User{} = user) do
    %{account: account} = Repo.preload(user, [:account])
    allow(account, user, :pay)
  end

  @doc """
  List all invoices against a subscription
  """
  @spec list_invoices(Subscription.t | Account.t | User.t, map) :: {:ok, Stripe.List.t(Stripe.Invoice.t)} | {:error, term}
  def list_invoices(object, opts \\ %{})
  def list_invoices(%Subscription{customer_id: customer} = sub, opts) when is_binary(customer) do
    %{installation: %{repository: %{publisher: %{billing_account_id: account_id}}}} =
      Core.Repo.preload(sub, [installation: [repository: :publisher]])

    Map.merge(%{customer: customer}, opts)
    |> Stripe.Invoice.list(connect_account: account_id)
  end

  def list_invoices(%Account{billing_customer_id: customer}, opts) when is_binary(customer) do
    Map.merge(%{customer: customer}, opts)
    |> Stripe.Invoice.list()
  end

  def list_invoices(%User{} = user, opts) do
    force_preload(user)
    |> Map.get(:account)
    |> list_invoices(opts)
  end

  def list_invoices(_, _), do: {:error, "no customer for this account"}

  @doc """
  Starts a stripe checkout to begin our Pro plan subscription
  """
  @spec initiate_checkout(User.t | Account.t) :: {:ok, Stripe.Checkout.Session.t} | error
  def initiate_checkout(%User{} = user) do
    force_preload(user)
    |> Map.get(:account)
    |> initiate_checkout()
  end

  def initiate_checkout(%Account{} = account) do
    account = Core.Repo.preload(account, [:root_user])
    plan = pro_plan!()

    %{
      payment_method_types: [:card, :us_bank_account],
      mode: "subscription",
      success_url: Core.url("/account/billing?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: Core.url("/account/billing?payment_failed=true"),
      line_items: [
        %{price: plan.base_price_id, quantity: 1},
        %{price: plan.metered_price_id},
        %{price: plan.ingest_meter_price_id}
      ]
    }
    |> add_customer_details(account)
    |> Stripe.Checkout.Session.create()
  end

  defp add_customer_details(attrs, %Account{billing_customer_id: cus_id}) when is_binary(cus_id),
    do: Map.put(attrs, :customer, cus_id)
  defp add_customer_details(attrs, %Account{root_user: %User{email: email}}),
    do: Map.put(attrs, :customer_email, email)
  defp add_customer_details(attrs, _), do: attrs

  @doc """
  Records a new subscription for a user after a successful Stripe checkout
  """
  @spec finalize_checkout(binary | Stripe.Checkout.Session.t, User.t) :: platform_sub_resp
  def finalize_checkout(session_id, %User{} = user) when is_binary(session_id) do
    case Stripe.Checkout.Session.retrieve(session_id) do
      {:ok, %Stripe.Checkout.Session{customer: cus_id, subscription: sub_id} = session} when is_binary(cus_id) and is_binary(sub_id) ->
        finalize_checkout(session, user)
      {:ok, %Stripe.Checkout.Session{}} -> {:error, "Stripe checkout did not complete successfully"}
      {:error, _} = error -> error
    end
  end

  def finalize_checkout(%Stripe.Checkout.Session{customer: cus_id, subscription: sub_id}, %User{} = user)
      when is_binary(cus_id) and is_binary(sub_id) do
    %{account: account} = Repo.preload(user, [account: :subscription])
    start_transaction()
    |> add_operation(:account, fn _ ->
      account
      |> Account.payment_changeset(%{billing_customer_id: cus_id})
      |> Core.Repo.update()
    end)
    |> add_operation(:subscription, fn _ ->
      plan = pro_plan!()
      case account.subscription do
        %PlatformSubscription{} = sub -> sub
        nil -> %PlatformSubscription{account_id: account.id}
      end
      |> PlatformSubscription.changeset(%{
        external_id: sub_id,
        plan_id: plan.id,
        billing_version: 1
      })
      |> Core.Repo.insert_or_update()
    end)
    |> execute(extract: :subscription)
  end

  def finalize_checkout(_, _), do: {:error, "could not find user and session for this checkout"}

  @doc """
  same as finalize_checkout/2, but for a Stripe.Checkout.Session that doesn't have the user passed in, fetches via the email
  on the associated stripe customer
  """
  @spec finalize_checkout(Stripe.Checkout.Session.t) :: platform_sub_resp
  def finalize_checkout(%Stripe.Checkout.Session{customer: cus_id} = session) do
    case Stripe.Customer.retrieve(cus_id) do
      {:ok, %Stripe.Customer{email: email}} when is_binary(email) ->
        finalize_checkout(session, Users.get_user_by_email(email))
      {:error, _} = error -> error
    end
  end

  def backfill_subscription(email, customer_id, subscription_id) do
    with %User{account: %Account{} = account} <- Users.get_user_by_email(email) |> Repo.preload([:account]) do
      start_transaction()
      |> add_operation(:account, fn _ ->
        Account.payment_changeset(account, %{billing_customer_id: customer_id})
        |> Core.Repo.update()
      end)
      |> add_operation(:subscription, fn _ ->
        plan = pro_plan!()
        %PlatformSubscription{account_id: account.id}
        |> PlatformSubscription.changeset(%{
          external_id: subscription_id,
          plan_id: plan.id,
          billing_version: 1,
        })
        |> Core.Repo.insert()
      end)
      |> execute(extract: :subscription)
    else
      _ -> {:error, "no user found for email #{email}"}
    end
  end

  @doc """
  It can list all cards attached to a customer
  """
  @spec list_cards(User.t | Account.t, map) :: {:ok, Stripe.List.t(Stripe.Card.t)} | {:error, term}
  def list_cards(user, opts \\ %{})
  def list_cards(%User{} = user, opts) do
    force_preload(user)
    |> Map.get(:account)
    |> list_cards(opts)
  end

  def list_cards(%Account{billing_customer_id: id}, _opts) when not is_nil(id) do
    with {:ok, %Stripe.List{data: items}} <- Stripe.Customer.list_payment_methods(id, %{type: :card}) do
      {:ok, %Stripe.List{has_more: false, data: Enum.map(items, & &1.card)}}
    end
  end

  def list_cards(_, _), do: {:ok, %Stripe.List{has_more: false, data: []}}


  @doc """
  Updates the default payment method for an account
  """
  @spec default_payment_method(User.t | Account.t, binary) :: {:ok, Stripe.Customer.t} | error
  def default_payment_method(%User{} = user, id) do
    %{account: account} = force_preload(user)
    with {:ok, account} <- allow(account, user, :pay) do
      default_payment_method(account, id)
    end
  end

  def default_payment_method(%Account{billing_customer_id: cus_id}, id) when is_binary(cus_id) do
    Stripe.Customer.update(cus_id, %{invoice_settings: %{default_payment_method: id}})
  end

  def default_payment_method(_, _), do: {:error, "you have yet to set up billing for your account"}

  @doc """
  It can list all payment methods attached to a customer
  """
  @spec list_payment_methods(Account.t, User.t, map) :: {:ok, Stripe.List.t(Stripe.PaymentMethod.t)} | error
  def list_payment_methods(%Account{billing_customer_id: id} = account, %User{} = user, opts) when is_binary(id) do
    with {:ok, _} <- allow(account, user, :pay) do
      Map.merge(%{customer: id}, opts)
      |> Stripe.PaymentMethod.list(expand: ["data.customer"])
    end
  end

  def list_payment_methods(_, _, _), do: {:ok, %Stripe.List{has_more: false, data: []}}

  @doc """
  Deletes a payment method if the user has permissions
  """
  @spec delete_payment_method(binary, User.t) :: {:ok, Stripe.PaymentMethod.t} | error
  def delete_payment_method(id, %User{} = user) do
    %{account: account} = Core.Repo.preload(user, [:account])
    with {:ok, _} <- allow(account, user, :pay) do
      Stripe.PaymentMethod.detach(%{payment_method: id})
    end
  end

  @spec has_plans?(binary) :: boolean
  def has_plans?(repository_id) do
    Plan.for_repository(repository_id)
    |> Core.Repo.exists?()
  end

  @spec enforce?() :: boolean
  def enforce?(), do: !!Core.conf(:enforce_pricing)

  @preloads [account: [subscription: :plan]]

  def preload(%User{} = user, opts \\ []), do: Core.Repo.preload(user, @preloads, opts)

  def force_preload(%User{} = user, preloads \\ [:account]), do: Core.Repo.preload(user, preloads, force: true)

  @doc """
  determine if an account (or a user's account) is currently delinquent
  """
  @spec delinquent?(User.t | Account.t) :: boolean
  def delinquent?(%Account{delinquent_at: at}) when not is_nil(at) do
    Timex.shift(at, days: 14)
    |> Timex.before?(Timex.now())
  end
  def delinquent?(%User{account: account}), do: delinquent?(account)
  def delinquent?(_), do: false

  @doc """
  determine if an account (or a user's account) should be grandfathered into old features
  """
  @spec grandfathered?(User.t | Account.t) :: boolean
  def grandfathered?(%User{account: account}), do: grandfathered?(account)
  def grandfathered?(%Account{grandfathered_until: at}) when not is_nil(at), do: Timex.after?(at, Timex.now())
  def grandfathered?(_), do: false

  @doc """
  Determine whether an account has reached a usage limit (currently only supported for users)
  """
  @spec limited?(User.t | Account.t, usage_dimension) :: boolean
  def limited?(%Account{delinquent_at: d}, _) when not is_nil(d), do: true
  def limited?(%Account{user_count: c, subscription: nil} = account, :user) when c >= @user_limit,
    do: !grandfathered?(account)
  def limited?(%User{} = user, limit) do
    preload(user, force: true)
    |> Map.get(:account)
    |> limited?(limit)
  end
  def limited?(_, _), do: false

  @doc """
  Determines if an account is on an enterprise plan
  """
  @spec enterprise?(Account.t | User.t) :: boolean
  def enterprise?(%Account{} = account) do
    case Core.Repo.preload(account, [subscription: :plan]) do
      %Account{subscription: %PlatformSubscription{plan: %PlatformPlan{enterprise: ent}}} -> ent
      _ -> false
    end
  end

  def enterprise?(%User{} = user) do
    preload(user)
    |> Map.get(:account)
    |> enterprise?()
  end

  @doc """
  Determine's if a user's account has access to the given feature.  Returns `true` if enforcement is not enabled yet.
  """
  @spec has_feature?(User.t | Account.t, atom) :: boolean
  def has_feature?(%Account{} = account, feature) do
    account = Core.Repo.preload(account, [subscription: :plan])
    case {enforce?(), delinquent?(account), grandfathered?(account), account} do
      {false, _, _, _} -> true
      {_, true, _, _} -> false
      {_, _, true, _} when feature != :cd -> true
      {_, _, _, %Account{subscription: %PlatformSubscription{plan: %PlatformPlan{enterprise: true}}}} -> true
      {_, _, _, %Account{subscription: %PlatformSubscription{plan: %PlatformPlan{features: %{^feature => true}}}}} -> true
      _ -> false
    end
  end

  def has_feature?(%User{} = user, feature) do
    preload(user)
    |> Map.get(:account)
    |> has_feature?(feature)
  end

  def has_feature?(_, _), do: false

  @doc """
  Completes the stripe oauth cycle and persists the account id to the publisher
  """
  @spec create_publisher_account(Publisher.t, binary) :: {:ok, Publisher.t} | error
  def create_publisher_account(%Publisher{} = publisher, code) do
    with {:ok, %{stripe_user_id: account_id}} <- Stripe.Connect.OAuth.token(code) do
      publisher
      |> Publisher.stripe_changeset(%{billing_account_id: account_id})
      |> Core.Repo.update()
    end
  end

  @doc "update plural subscription status"
  @spec update_subscription_status(map, binary) :: platform_sub_resp | {:ok, nil}
  def update_subscription_status(attrs, id) do
    case Core.Repo.get_by(PlatformSubscription, external_id: id) do
      nil -> {:ok, nil}
      sub -> PlatformSubscription.stripe_changeset(sub, attrs) |> Core.Repo.update()
    end
  end

  @doc """
  Attempt to fetch the latest invoice for a stripe subscription
  """
  @spec latest_invoice(PlatformSubscription.t) :: {:ok, Stripe.Invoice.t} | error
  def latest_invoice(%PlatformSubscription{external_id: id}) when is_binary(id) do
    case Stripe.Subscription.retrieve(id, expand: ["latest_invoice.payment_intent"]) do
      {:ok, %Stripe.Subscription{latest_invoice: invoice}} -> {:ok, invoice}
      error -> error
    end
  end
  def latest_invoice(_), do: {:error, "no stripe subscription present"}


  @doc """
  Modifies delinquency for an account.  If an account is already delinquent, we don't want to move its timestamp into  the future,
  so it's ignored.  Otherwise, if it's delinquent, it can always be marked undelinquent, and vice-versa.
  """
  @spec toggle_delinquent(binary | Account.t, term) :: {:ok, Account.t} | error
  def toggle_delinquent(cust_id, deliquent_at \\ Timex.now())
  def toggle_delinquent(%Account{delinquent_at: del} = account, now) when not is_nil(del) and not is_nil(now),
    do: {:ok, account}
  def toggle_delinquent(%Account{} = account, delinquent_at) do
    start_transaction()
    |> add_operation(:account, fn _ ->
      Core.Repo.preload(account, [:subscription])
      |> Account.payment_changeset(%{delinquent_at: delinquent_at})
      |> Core.Repo.update()
    end)
    |> add_operation(:subscription, fn %{account: %{subscription: sub}} ->
      PlatformSubscription.stripe_changeset(sub, %{status: (if delinquent_at, do: :delinquent, else: :current)})
      |> Core.Repo.update()
    end)
    |> execute(extract: :account)
  end
  def toggle_delinquent(nil, _), do: {:error, "account not found"}
  def toggle_delinquent(id, val) when is_binary(id) do
    get_account(id)
    |> toggle_delinquent(val)
  end

  @doc """
  auto-provisions a customer and creates a new setup intent for them
  """
  @spec setup_intent(map, User.t | Account.t) :: {:ok, Stripe.SetupIntent.t} | error
  def setup_intent(args \\ %{}, user)

  def setup_intent(args, %User{} = user) do
    Core.Repo.preload(user, [:account], force: true)
    |> Map.get(:account)
    |> allow(user, :pay)
    |> when_ok(&setup_intent(args, &1))
  end

  def setup_intent(args, %Account{} = account) do
    start_transaction()
    |> add_operation(:customer, fn _ -> provision_customer(account, args) end)
    |> add_operation(:stripe, fn %{customer: %{billing_customer_id: cus_id}} ->
      Stripe.SetupIntent.create(%{
        customer: cus_id,
        usage: "off_session",
        automatic_payment_methods: %{enabled: true}
      })
    end)
    |> execute(extract: :stripe)
  end

  @doc """
  Cancels a subscription for a user, and deletes the record in our database
  """
  @spec cancel_subscription(Subscription.t, User.t) :: {:ok, Subscription.t} | {:error, term}
  def cancel_subscription(%Subscription{external_id: eid} = subscription, %User{} = user) do
    %{installation: %{repository: %{publisher: %{billing_account_id: account_id}}}} =
      Core.Repo.preload(subscription, [installation: [repository: :publisher]])

    start_transaction()
    |> add_operation(:db, fn _ ->
      subscription
      |> allow(user, :delete)
      |> when_ok(:delete)
    end)
    |> add_operation(:stripe, fn _ ->
      Stripe.Subscription.cancel(eid, connect_account: account_id)
    end)
    |> execute(extract: :db)
  end

  @doc """
  Cancels a subscription for a user, and deletes the record in our database
  """
  @spec cancel_platform_subscription(PlatformSubscription.t, User.t) :: platform_sub_resp
  def cancel_platform_subscription(%PlatformSubscription{external_id: eid} = subscription, %User{} = user) do
    start_transaction()
    |> add_operation(:db, fn _ ->
      subscription
      |> allow(user, :delete)
      |> when_ok(:delete)
    end)
    |> add_operation(:stripe, fn _ -> Stripe.Subscription.cancel(eid) end)
    |> execute(extract: :db)
  end

  @spec cancel_platform_subscription(User.t) :: platform_sub_resp
  def cancel_platform_subscription(%User{} = user) do
    %{account: account} = force_preload(user)

    get_platform_subscription_by_account!(account.id)
    |> cancel_platform_subscription(user)
  end

  def defer_ingest(%User{} = user, bytes) when is_integer(bytes) and bytes > 0 do
    Core.broker().publish(%Conduit.Message{body: {:ingest, user, bytes}}, :billing)
  end
  def defer_ingest(_, _), do: :ok

  def meter_ingest(%User{} = user, bytes) when is_integer(bytes) do
    case Core.Repo.preload(user, [:account]) do
      %{account: %Account{billing_customer_id: cus_id}} when is_binary(cus_id) ->
        send_meter(cus_id, "pro_data_ingested", bytes)
      _ -> :ok
    end
  end
  def meter_ingest(_, _), do: :ok

  def send_usage(%PlatformSubscription{account_id: aid} = sub) do
    with %PlatformSubscription{account: %Account{billing_customer_id: cus_id}} <- Core.Repo.preload(sub, [:account]),
         clusters when is_integer(clusters) <- Clusters.clusters(aid) do
      send_meter(cus_id, "pro_clusters", clusters)
    end
  end

  defp send_meter(cus_id, meter, quantity) do
    Stripe.API.request(%{
      event_name: meter,
      payload: %{
        stripe_customer_id: cus_id,
        value: quantity
      }
    }, :post, "/v1/billing/meter_events", %{}, api_version: "2024-06-20")
  end

  @doc """
  Creates a stripe customer with the given source and user email, saves
  the customer back to storage.
  """
  @spec create_card(User.t | Account.t, binary, map | nil) :: {:ok, Account.t} | {:error, term}
  def create_card(user, source, address \\ nil)

  def create_card(%User{} = user, source_token, address) do
    %{account: account} = Core.Repo.preload(user, [account: :root_user], force: true)
    create_card(account, source_token, address)
  end

  def create_card(%Account{root_user: %User{}, billing_customer_id: nil} = account, source_token, address) do
    start_transaction()
    |> add_operation(:account, fn _ ->
      case address do
        %{} = address ->
          Account.changeset(account, %{billing_address: address})
          |> Core.Repo.update()
        nil -> {:ok, account}
      end
    end)
    |> add_operation(:stripe, fn %{account: account} ->
      with {:ok, stripe} <- stripe_attrs(account),
        do: Stripe.Customer.create(Map.put(stripe, :source, source_token))
    end)
    |> add_operation(:customer, fn %{account: account, stripe: %{id: id}} ->
      account
      |> Account.payment_changeset(%{billing_customer_id: id})
      |> Core.Repo.update()
    end)
    |> execute(extract: :customer)
  end

  def create_card(%Account{billing_customer_id: cus_id} = account, source, _) do
    with {:ok, _} <- Stripe.Card.create(%{customer: cus_id, source: source}),
         {:ok, _} <- pay_outstanding_invoices(cus_id, source),
      do: {:ok, account}
  end

  @doc """
  generate stripe customer attrs from a preloaded account
  """
  @spec stripe_attrs(Account.t) :: {:ok, map} | {:error, binary}
  def stripe_attrs(%Account{root_user: %User{email: email, name: name}, billing_address: %{} = address}) do
    {:ok, %{email: email, name: Map.get(address, :name) || name, address: Address.to_stripe(address)}}
  end
  def stripe_attrs(%Account{root_user: %User{email: email, name: name}}), do: {:ok, %{email: email, name: name}}
  def stripe_attrs(_), do: {:error, "you must provide a billing address to enable billing"}

  @doc """
  Detaches a card from a customer
  """
  @spec delete_card(binary, User.t) :: {:ok, User.t} | {:error, term}
  def delete_card(id, %User{} = user) do
    with %{account: %Account{billing_customer_id: cus_id} = account} when not is_nil(cus_id) <- force_preload(user),
         {:ok, _} <- Stripe.Card.delete(id, %{customer: cus_id}) do
      {:ok, account}
    else
      %User{} -> {:error, :invalid_argument}
      error -> error
    end
  end

  @doc """
  Finds and pays any undpaid invoices for this customer.  Useful to quickly pay on card changes and other events
  """
  @spec pay_outstanding_invoices(binary, binary) :: {:ok, term} | error
  def pay_outstanding_invoices(customer_id, source) do
    with {:ok, %Stripe.List{data: invoices}} <- Stripe.Invoice.list(%{customer: customer_id}) do
      Enum.filter(invoices, fn
        %Stripe.Invoice{status: s} when s in ~w(open uncollectible) -> true
        _ -> false
      end)
      |> Enum.reduce(short_circuit(), fn invoice, circuit ->
        short(circuit, invoice.id, fn ->
          Stripe.Invoice.pay(invoice.id, %{source: source})
        end)
      end)
      |> execute()
    end
  end

  @doc """
  Creates a platform-level plan transactionally in stripe and our db
  """
  @spec create_platform_plan(map) :: platform_plan_resp
  def create_platform_plan(attrs) do
    start_transaction()
    |> add_operation(:db, fn _ ->
      %PlatformPlan{}
      |> PlatformPlan.changeset(attrs)
      |> Core.Repo.insert()
    end)
    |> add_operation(:stripe, fn %{db: plan} ->
      build_plan_ops([base: %{
        amount:   plan.cost,
        currency: "USD",
        interval: stripe_interval(plan.period),
        product: %{name: plan.name}
      }], plan.line_items)
      |> Enum.reduce(short_circuit(), fn {name, op}, circuit ->
        short(circuit, name, fn ->  Stripe.Plan.create(op) end)
      end)
      |> execute()
    end)
    |> add_operation(:finalized, fn %{db: %{line_items: items} = db, stripe: %{base: %{id: id}} = stripe} ->
      rest = Map.drop(stripe, [:base])

      items = Enum.map(items, fn %{dimension: dimension} = item ->
        Piazza.Ecto.Schema.mapify(item)
        |> Map.put(:external_id, rest[dimension].id)
      end)

      db
      |> PlatformPlan.changeset(%{external_id: id, line_items: items})
      |> Core.Repo.update()
    end)
    |> execute(extract: :finalized)
  end

  def backfill_plan_features() do
    Enum.each(~w(monthly yearly), fn period ->
      with %PlatformPlan{} = p <- Core.Repo.get_by(PlatformPlan, name: "Pro", visible: true, period: period) do
        PlatformPlan.changeset(p, %{features: Enum.into(PlatformPlan.features(), %{}, & {&1, true})})
        |> Core.Repo.update()
      end
    end)
  end

  def setup_plans() do
    {:ok, _} = create_default_plan(:monthly)
    {:ok, _} = create_default_plan(:yearly)

    case get_platform_plan_by_name("Enterprise") do
      %PlatformPlan{} = p -> {:ok, p}
      _ ->
        %PlatformPlan{}
        |> PlatformPlan.changeset(%{
          cost: 0,
          name: "Enterprise",
          period: :monthly,
          visible: true,
          enterprise: true,
          features: %{vpn: true, user_management: true, audit: true},
          line_items: [
            %{name: "User", dimension: :user, period: :monthly, cost: 4900}, # these costs are arbitrary, as won't be billed through stripe
            %{name: "Cluster", dimension: :cluster, period: :monthly, cost: 39900}
          ]
        })
        |> Core.Repo.insert()
    end
  end

  def create_trial_plan() do
    %PlatformPlan{}
    |> PlatformPlan.changeset(%{
      cost: 0,
      name: "Pro Trial",
      period: :monthly,
      visible: false,
      trial: true,
      features: %{vpn: true, user_management: true, audit: true, multi_cluster: true},
      line_items: [
        %{name: "User", dimension: :user, period: :monthly, cost: 4900},
        %{name: "Cluster", dimension: :cluster, period: :monthly, cost: 39900}
      ]
    })
    |> Core.Repo.insert()
  end

  def create_default_plan(period) do
    with {:ok, nil} <- {:ok, Core.Repo.get_by(PlatformPlan, name: "Pro", visible: true, period: period)} do
      create_platform_plan(%{
        cost: 0,
        name: "Pro",
        period: period,
        visible: true,
        features: %{vpn: true, user_management: true, audit: true},
        line_items: [
          %{name: "User", dimension: :user, period: period, cost: discount(4900, period)},
          %{name: "Cluster", dimension: :cluster, period: period, cost: discount(39900, period)}
        ]
      })
    end
  end

  @doc """
  Set all self serve (non-enterprise) plans to the expected feature set
  """
  @spec migrate_plans() :: {:ok, %{binary => PlatformPlan.t}} | error
  def migrate_plans() do
    features = PlatformPlan.features()
               |> Map.new(& {&1, true})
    PlatformPlan.self_serve()
    |> Core.Repo.all()
    |> Enum.reduce(start_transaction(), fn %{id: id} = plan, xact ->
      add_operation(xact, id, fn _ ->
        PlatformPlan.changeset(plan, %{features: features})
        |> Core.Repo.update()
      end)
    end)
    |> execute()
  end

  defp discount(amount, :yearly), do: round(9 * amount / 10) * 12
  defp discount(amount, _), do: amount

  @spec setup_enterprise_plan(User.t | binary) :: platform_sub_resp
  def setup_enterprise_plan(%User{} = user) do
    case Repo.preload(user, [account: [subscription: :plan]]) do
      %{account: %Account{} = account} ->
        with {:ok, _} <- remove_trial(account),
          do: setup_enterprise_plan(user.account_id)
      _ -> setup_enterprise_plan(user.account_id)
    end
  end
  def setup_enterprise_plan(account_id) when is_binary(account_id) do
    plan = get_platform_plan_by_name!("Enterprise")

    %PlatformSubscription{account_id: account_id}
    |> PlatformSubscription.changeset(%{plan_id: plan.id})
    |> Core.Repo.insert()
  end

  @spec remove_enterprise_plan(binary) :: platform_sub_resp
  def remove_enterprise_plan(account_id) do
    Repo.get_by(PlatformSubscription, account_id: account_id)
    |> Repo.preload([:plan])
    |> case do
      %PlatformSubscription{plan: %PlatformPlan{enterprise: true}} = sub ->
        Repo.delete(sub)
      _ -> {:error, "account #{account_id} is not on an enterprise plan"}
    end
  end

  @doc """
  Creates a plan and associated add-ons.  Transactionally creates them in stripe, then
  restitches them back into the db.

  Fails if the user is not a publisher of the repo
  """
  @spec create_plan(map, Repository.t | binary, User.t) :: plan_resp
  def create_plan(attrs, %Repository{id: id} = repo, %User{} = user) do
    %{publisher: publisher} = Core.Repo.preload(repo, [:publisher])

    start_transaction()
    |> add_operation(:db, fn _ ->
      %Plan{repository_id: id}
      |> Plan.changeset(attrs)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:stripe, fn %{db: plan} ->
      build_plan_ops([base: %{
        amount:   plan.cost,
        currency: "USD",
        interval: stripe_interval(plan.period),
        product: %{name: plan.name}
      }], plan.line_items)
      |> Enum.reduce(short_circuit(), fn {name, op}, circuit ->
        short(circuit, name, fn ->
          Stripe.Plan.create(op, connect_account: publisher.billing_account_id)
        end)
      end)
      |> execute()
    end)
    |> add_operation(:finalized, fn %{db: db, stripe: %{base: %{id: id}} = stripe} ->
      rest = Map.delete(stripe, :base)

      db
      |> Plan.changeset(Map.merge(%{external_id: id}, restitch_line_items(db, rest)))
      |> Core.Repo.update()
    end)
    |> execute(extract: :finalized)
  end
  def create_plan(attrs, repo_id, user),
    do: create_plan(attrs, Repositories.get_repository!(repo_id), user)

  @doc """
  Updates whitelisted plan fields (those without direct billing implications).

  """
  @spec update_plan_attributes(map, binary, User.t) :: plan_resp
  def update_plan_attributes(attrs, id, %User{} = user) do
    get_plan!(id)
    |> Plan.update_changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:update)
  end

  defp build_plan_ops(ops, %{items: items}), do: build_plan_ops(ops, items)
  defp build_plan_ops(ops, items) when is_list(items) do
    Enum.map(items, fn %{cost: cost, period: period, name: name, dimension: dim} = item ->
      plan = Map.merge(%{
        amount: cost,
        currency: "USD",
        interval: stripe_interval(period),
        product: %{name: name},
      }, item_type(item))
      {dim, plan}
    end)
    |> Enum.concat(ops)
  end
  defp build_plan_ops(ops, _), do: ops

  defp item_type(%{type: t}), do: %{usage_type: t || :licensed}
  defp item_type(_), do: %{}

  defp restitch_line_items(%{line_items: %{items: items}}, rest) do
    %{line_items: %{
      items: Enum.map(items, fn %{dimension: dimension} = item ->
          Piazza.Ecto.Schema.mapify(item)
          |> Map.put(:external_id, rest[dimension].id)
        end)
      }
    }
  end
  defp restitch_line_items(_, _), do: %{}

  @doc """
  Creates a new subscription for the given plan/installation.  Will
  transactionally create it in stripe (with line items), then persist back
  the stripe data to the subscription.

  Fails if the user is not the installer
  """
  @spec create_platform_subscription(map, binary | PlatformPlan.t, User.t) :: platform_sub_resp
  def create_platform_subscription(attrs \\ %{}, plan, user)
  def create_platform_subscription(attrs, %PlatformPlan{} = plan, %User{} = user) do
    start_transaction()
    |> add_operation(:account, fn _ ->
      %{account: account} = preload(user, force: true)
      provision_customer(account, attrs)
    end)
    |> add_operation(:trial, fn %{account: account} -> remove_trial(account) end)
    |> add_operation(:db, fn %{account: %Account{cluster_count: cc, user_count: uc} = account} ->
      %PlatformSubscription{plan_id: plan.id, plan: plan, account_id: account.id}
      |> PlatformSubscription.changeset(Map.put(attrs, :line_items, [
        %{dimension: :cluster, quantity: cc},
        %{dimension: :user, quantity: uc}
      ]))
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:stripe, fn %{account: %Account{billing_customer_id: cust_id}, db: db} ->
      Stripe.Subscription.create(%{
        customer: cust_id,
        items: sub_line_items(plan, db) ++ metered_plan(plan),
        payment_behavior: "default_incomplete",
        off_session: true
      })
    end)
    |> add_operation(:finalized, fn
      %{
        stripe: %{id: sub_id, items: %{data: items}},
        db: subscription
      } ->
      metered = Enum.find(items, & &1.plan.id == plan.service_plan)
      items = Enum.filter(items, & &1.plan.id != plan.service_plan)

      subscription
      |> PlatformSubscription.stripe_changeset(%{
        external_id: sub_id,
        metered_id: metered && metered.id,
        line_items: rebuild_line_items(subscription, plan, items)
      })
      |> Core.Repo.update()
    end)
    |> execute(extract: :finalized)
    |> notify(:create)
  end
  def create_platform_subscription(attrs, plan_id, %User{} = user),
    do: create_platform_subscription(attrs, get_platform_plan!(plan_id), user)

  defp metered_plan(%PlatformPlan{service_plan: p}) when is_binary(p), do: [%{plan: p}]
  defp metered_plan(_), do: []


  defp provision_customer(%Account{billing_customer_id: nil} = account, args) do
    account = Core.Repo.preload(account, [:root_user])
    start_transaction()
    |> add_operation(:account, fn _ ->
      case args do
        %{billing_address: %{} = address} ->
          Account.changeset(account, %{billing_address: address})
          |> Core.Repo.update()
        _ -> {:ok, account}
      end
    end)
    |> add_operation(:stripe, fn %{account: account} ->
      with {:ok, stripe} <- stripe_attrs(account),
        do: Stripe.Customer.create(stripe)
    end)
    |> add_operation(:customer, fn %{account: account, stripe: %Stripe.Customer{id: id}} ->
      account
      |> Account.payment_changeset(%{billing_customer_id: id})
      |> Core.Repo.update()
    end)
    |> add_operation(:default, fn %{customer: account} ->
      case args do
        %{payment_method: method} when is_binary(method) -> default_payment_method(account, method)
        _ -> {:ok, account}
      end
    end)
    |> execute(extract: :customer)
  end
  defp provision_customer(%Account{} = account, %{payment_method: method}) when is_binary(method) do
    with {:ok, _} <- default_payment_method(account, method),
      do: {:ok, account}
  end
  defp provision_customer(%Account{} = account, _), do: {:ok, account}

  @doc """
  Cancels a user's subscription in stripe and wipes the reference to it in our db.  This effectively converts the
  user to OSS
  """
  @spec delete_platform_subscription(User.t) :: {:ok, Account.t} | error
  def delete_platform_subscription(%User{} = user) do
    start_transaction()
    |> add_operation(:fetch, fn _ ->
      case Core.Repo.preload(user, [account: [subscription: :plan]], force: true) do
        %{account: %Account{subscription: %PlatformSubscription{plan: %PlatformPlan{enterprise: true}}}} ->
          {:error, "to remove an enterprise subscription contact your account representative"}
        %{account: %Account{subscription: nil}} -> {:error, "your account has no subscription"}
        %{account: account} -> {:ok, account}
      end
    end)
    |> add_operation(:db, fn %{fetch: %{subscription: subscription}} ->
      subscription
      |> allow(user, :delete)
      |> when_ok(:delete)
    end)
    |> add_operation(:account, fn %{fetch: account} -> {:ok, %{account | subscription: nil}} end)
    |> add_operation(:stripe, fn %{db: %{external_id: ext_id}} ->
      case Stripe.Subscription.cancel(ext_id) do
        {:ok, _} = success -> success
        {:error, %Stripe.Error{extra: %{http_status: 404}}} -> {:ok, nil}
        error -> error
      end
    end)
    |> execute(extract: :account)
    |> notify(:delete)
  end

  @doc """
  Creates a new subscription for the given plan/installation.  Will
  transactionally create it in stripe (with line items), then persist back
  the stripe data to the subscription.

  Fails if the user is not the installer
  """
  @spec create_subscription(map, Plan.t, Installation.t, User.t) :: {:ok, Subscription.t} | {:error, term}
  def create_subscription(attrs \\ %{}, plan, inst, user)
  def create_subscription(_, _, _, %User{customer_id: nil}), do: {:error, "No payment method"}
  def create_subscription(attrs, %Plan{} = plan, %Installation{} = installation, %User{} = user) do
    %{repository: %{publisher: %{billing_account_id: account_id}}} = plan =
      Core.Repo.preload(plan, [repository: :publisher])

    start_transaction()
    |> add_operation(:db, fn _ ->
      %Subscription{plan_id: plan.id, plan: plan}
      |> Subscription.changeset(Map.merge(attrs, %{installation_id: installation.id}))
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:customer, fn _ ->
      with {:ok, %{id: id}} <- Stripe.Token.create(%{
        customer: user.customer_id
      }, connect_account: account_id) do
        Stripe.Customer.create(%{
          email: user.email,
          source: id
        }, connect_account: account_id)
      end
    end)
    |> add_operation(:stripe, fn %{customer: customer, db: db} ->
      Stripe.Subscription.create(%{
        customer: customer.id,
        application_fee_percent: conf(:application_fee),
        items: [%{plan: plan.external_id} | sub_line_items(plan, db)]
      }, connect_account: account_id)
    end)
    |> add_operation(:finalized, fn
      %{
        stripe: %{id: sub_id, items: %{data: [%{id: id} | rest]}},
        customer: %{id: cus_id},
        db: subscription
      } ->
      subscription
      |> Subscription.stripe_changeset(%{
        external_id: sub_id,
        customer_id: cus_id,
        line_items: %{
          item_id: id,
          items: rebuild_line_items(subscription, plan, rest)
        }
      })
      |> Core.Repo.update()
    end)
    |> execute(extract: :finalized)
    |> notify(:create)
  end
  def create_subscription(attrs, plan_id, inst_id, %User{} = user) do
    plan = get_plan!(plan_id)
    inst = Repositories.get_installation!(inst_id)

    create_subscription(attrs, plan, inst, user)
  end

  @doc """
  Updates the quantity of a specific line item.  Persists the update to stripe transactionally.

  Fails if the user is not the subscriber.
  """
  @spec update_line_item(%{dimension: binary, quantity: integer}, Subscription.t | binary, User.t) :: {:ok, Subscription.t} | {:error, any}
  def update_line_item(
    %{dimension: dim, quantity: quantity},
    %Subscription{line_items: %{items: items}} = sub,
    %User{} = user
  ) do
    %{installation: %{repository: %{publisher: %{billing_account_id: account_id}}}} = sub =
      Core.Repo.preload(sub, [:plan, installation: [repository: :publisher]])

    start_transaction()
    |> add_operation(:db, fn _ ->
      sub
      |> Subscription.changeset(%{line_items: %{
        items: rebuild_subscription_items(items, dim, quantity)
      }})
      |> allow(user, :edit)
      |> when_ok(:update)
    end)
    |> add_operation(:stripe, fn %{db: %{line_items: %{items: items}}} ->
      with %{external_id: ext_id, quantity: quantity} <- Enum.find(items, & &1.dimension == dim) do
        Stripe.SubscriptionItem.update(ext_id, %{quantity: quantity}, connect_account: account_id)
      else
        _ -> {:error, :not_found}
      end
    end)
    |> execute(extract: :db)
    |> notify(:update)
  end
  def update_line_item(attrs, subscription_id, user),
    do: update_line_item(attrs, get_subscription!(subscription_id), user)


  @doc """
  Aligns usage with the current counts on the account.  If the account has no platform subscription, just removes the update market
  """
  @spec sync_usage(Account.t) :: platform_sub_resp
  def sync_usage(%Account{
    user_count: u,
    cluster_count: c,
    subscription: %PlatformSubscription{external_id: ext_id} = s,
    root_user: user
  } = account) when is_binary(ext_id) do
    user = Core.Services.Rbac.preload(user)

    start_transaction()
    |> add_operation(:account, fn _ ->
      account
      |> Ecto.Changeset.change(%{usage_updated: false})
      |> Core.Repo.update()
    end)
    |> add_operation(:users, fn _ ->
      update_platform_line_item(%{dimension: :user, quantity: u}, s, user)
    end)
    |> add_operation(:clusters, fn %{users: s} ->
      update_platform_line_item(%{dimension: :cluster, quantity: c}, s, user)
    end)
    |> execute(extract: :clusters)
  end

  def sync_usage(%Account{subscription: %Ecto.Association.NotLoaded{}} = account) do
    Core.Repo.preload(account, [:root_user, :subscription])
    |> sync_usage()
  end

  def sync_usage(%Account{} = account) do
    account
    |> Ecto.Changeset.change(%{usage_updated: false})
    |> Core.Repo.update()
  end



  @doc """
  Updates the quantity of a specific line item for a platform plan. Persists the update to stripe transactionally.

  Fails if the user does not have billing permissions
  """
  @spec update_platform_line_item(%{dimension: binary, quantity: integer}, PlatformSubscription.t | binary, User.t) :: platform_sub_resp
  def update_platform_line_item(
    %{dimension: dim, quantity: quantity},
    %PlatformSubscription{line_items: items} = sub,
    %User{} = user
  ) do
    start_transaction()
    |> add_operation(:db, fn _ ->
      sub
      |> PlatformSubscription.changeset(%{
        line_items: rebuild_subscription_items(items, dim, quantity)
      })
      |> allow(user, :edit)
      |> when_ok(:update)
    end)
    |> add_operation(:stripe, fn %{db: %{line_items: items}} ->
      with %{external_id: ext_id, quantity: quantity} <- Enum.find(items, & &1.dimension == dim) do
        Stripe.SubscriptionItem.update(ext_id, %{quantity: quantity})
      else
        _ -> {:error, :not_found}
      end
    end)
    |> execute(extract: :db)
    |> notify(:update)
  end
  def update_platform_line_item(attrs, subscription_id, user),
    do: update_platform_line_item(attrs, get_platform_subscription!(subscription_id), user)

  @doc """
  Moves the subscription to the given plan.  Will migrate all line items to the new
  plan and readjust according to any difference in included items.

  Fails if the plan is not for the associated repository or the user isn't the installer.
  """
  @spec update_plan(Plan.t, Subscription.t, User.t) :: {:ok, Subscription.t} | {:error, term}
  def update_plan(%Plan{id: id, external_id: ext_id, repository_id: repo_id} = plan, %Subscription{} = sub, %User{} = user) do
    %{installation: %{repository: %{publisher: %{billing_account_id: account_id}}}} = sub =
      Core.Repo.preload(sub, [:plan, installation: [repository: :publisher]])

    start_transaction()
    |> add_operation(:validate, fn _ ->
      case sub do
        %{installation: %{repository: %{id: ^repo_id}}} = sub -> {:ok, sub}
        _ -> {:error, "Plan #{id} is not valid for repository #{repo_id}"}
      end
    end)
    |> add_operation(:db, fn _ ->
      sub
      |> Subscription.changeset(%{
        plan_id: id,
        line_items: %{items: migrate_line_items(plan, sub)}
      })
      |> allow(user, :edit)
      |> when_ok(:update)
      |> when_ok(&Core.Repo.preload(&1, [:plan], force: true))
    end)
    |> add_operation(:stripe, fn %{db: updated} ->
      Stripe.Subscription.update(sub.external_id, %{
        items: old_items(sub) ++ [%{plan: ext_id}] ++ sub_line_items(updated.plan, updated)
      }, connect_account: account_id)
    end)
    |> add_operation(:finalized, fn
      %{
        stripe: %{id: sub_id, items: %{data: [%{id: id} | rest]}},
        db: subscription
      } ->
      subscription
      |> Subscription.stripe_changeset(%{
        external_id: sub_id,
        line_items: %{
          item_id: id,
          items: rebuild_line_items(subscription, subscription.plan, rest)
        }
      })
      |> Core.Repo.update()
    end)
    |> execute(extract: :finalized)
    |> notify(:update)
  end
  def update_plan(plan_id, sub_id, user) do
    get_plan!(plan_id)
    |> update_plan(get_subscription!(sub_id), user)
  end

  @doc """
  Moves the platform subscription to the given plan.  Will migrate all line items to the new
  plan and readjust according to any difference in included items.
  """
  @spec update_plan(PlatformPlan.t, PlatformSubscription.t, User.t) :: platform_sub_resp
  def update_platform_plan(%PlatformPlan{id: id} = plan, %User{} = user) do
    %{account: account} = preload(user)
    sub = get_platform_subscription_by_account!(account.id)

    start_transaction()
    |> add_operation(:db, fn _ ->
      sub
      |> PlatformSubscription.changeset(%{
        plan_id: id,
        line_items: migrate_line_items(plan, sub)
      })
      |> allow(user, :edit)
      |> when_ok(:update)
      |> when_ok(&Core.Repo.preload(&1, [:plan], force: true))
    end)
    |> add_operation(:stripe, fn %{db: updated} ->
      Stripe.Subscription.update(sub.external_id, %{
        items: (
          old_items(sub) ++
          (if sub.metered_id, do: [%{id: sub.metered_id, deleted: true}], else: []) ++
          sub_line_items(updated.plan, updated) ++
          metered_plan(plan)
        )
      })
    end)
    |> add_operation(:finalized, fn
      %{
        stripe: %{id: sub_id, items: %{data: items}},
        db: subscription
      } ->
      metered = Enum.find(items, & &1.plan.id == plan.service_plan)
      items = Enum.filter(items, & &1.plan.id != plan.service_plan)

      subscription
      |> PlatformSubscription.stripe_changeset(%{
        external_id: sub_id,
        metered_id: metered && metered.id,
        line_items: rebuild_line_items(subscription, subscription.plan, items)
      })
      |> Core.Repo.update()
    end)
    |> execute(extract: :finalized)
    |> notify(:update)
  end
  def update_platform_plan(plan_id, user) do
    get_platform_plan!(plan_id)
    |> update_platform_plan(user)
  end

  defp old_items(%PlatformSubscription{line_items: items}), do: Enum.map(items, & %{id: &1.external_id, deleted: true})
  defp old_items(%Subscription{line_items: %{item_id: item_id, items: items}}) do
    line_items = Enum.map(items, fn %{external_id: id} -> %{id: id, deleted: true} end)
    [%{id: item_id, deleted: true} | line_items]
  end

  defp sub_line_items(%PlatformPlan{line_items: line_items}, %PlatformSubscription{line_items: items}) do
    by_dimension = Enum.into(items, %{}, & {&1.dimension, &1})

    Enum.map(line_items, fn %{external_id: id, dimension: dim} ->
      %{plan: id, quantity: fetch_quantity(by_dimension[dim])}
    end)
  end

  defp sub_line_items(
    %Plan{line_items: %{items: line_items}},
    %Subscription{line_items: %{items: items}}
  ) when is_list(line_items) and is_list(items) do
    by_dimension = Enum.into(items, %{}, & {&1.dimension, &1})

    Enum.map(line_items, fn
      %{external_id: id, type: :metered} -> %{plan: id}
      %{external_id: id, dimension: dim} ->
        %{plan: id, quantity: fetch_quantity(by_dimension[dim])}
    end)
  end
  defp sub_line_items(_, _), do: []

  defp migrate_line_items(%PlatformPlan{line_items: items}, subscription) do
    Enum.map(items, fn %{dimension: dimension} ->
      current = PlatformSubscription.dimension(subscription, dimension)
      %{dimension: dimension, quantity: current}
    end)
  end

  defp migrate_line_items(%Plan{line_items: %{items: items, included: included}}, subscription) do
    by_dimension = Enum.into(included, %{}, & {&1.dimension, &1})

    Enum.map(items, fn %{dimension: dimension} ->
      current  = Subscription.dimension(subscription, dimension)
      included = fetch_quantity(by_dimension[dimension])
      %{dimension: dimension, quantity: max(current - included, 0)}
    end)
  end

  defp rebuild_line_items(
    %Subscription{line_items: %{items: items}},
    %Plan{line_items: %{items: line_items}},
    stripe_items
  ) when is_list(line_items), do: rebuild_line_items(items, line_items, stripe_items)
  defp rebuild_line_items(
    %PlatformSubscription{line_items: items},
    %PlatformPlan{line_items: line_items},
    stripe_items
  ) when is_list(line_items), do: rebuild_line_items(items, line_items, stripe_items)
  defp rebuild_line_items(items, line_items, stripe_items) when is_list(line_items) and is_list(items) do
    by_stripe_id = Enum.into(stripe_items, %{}, & {&1.plan.id, &1})
    by_dimension = Enum.into(items, %{}, & {&1.dimension, &1})

    Enum.map(line_items, fn %{external_id: id, dimension: dim} ->
      %{
        dimension: dim,
        quantity: fetch_quantity(by_dimension[dim]),
        external_id: by_stripe_id[id].id
      }
    end)
  end
  defp rebuild_line_items(_, _, _), do: []

  defp rebuild_subscription_items(items, dimension, quantity) do
    Enum.map(items, fn
      %{dimension: ^dimension} = item -> %{Piazza.Ecto.Schema.mapify(item) | quantity: quantity}
      item -> Piazza.Ecto.Schema.mapify(item)
    end)
    |> Enum.map(&Map.take(&1, [:dimension, :quantity, :external_id]))
  end

  defp fetch_quantity(%{quantity: quantity}) when is_integer(quantity), do: quantity
  defp fetch_quantity(_), do: 0

  defp stripe_interval(:monthly), do: "month"
  defp stripe_interval(:yearly), do: "year"

  defp notify({:ok, %Subscription{} = sub}, :create),
    do: handle_notify(PubSub.SubscriptionCreated, sub)
  defp notify({:ok, %PlatformSubscription{} = sub}, :create),
    do: handle_notify(PubSub.PlatformSubscriptionCreated, sub)
  defp notify({:ok, %Subscription{} = sub}, :update),
    do: handle_notify(PubSub.SubscriptionUpdated, sub)
  defp notify(error, _), do: error
end
