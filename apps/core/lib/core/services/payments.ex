defmodule Core.Services.Payments do
  use Core.Services.Base
  import Core.Policies.Payments

  alias Core.Services.{Repositories}
  alias Core.Schema.{
    Publisher,
    User,
    Repository,
    Plan,
    Subscription,
    Installation
  }

  def get_plan!(id), do: Core.Repo.get!(Plan, id)

  def create_publisher_account(%Publisher{} = publisher, code) do
    with {:ok, %{stripe_user_id: account_id}} <- Stripe.Connect.OAuth.token(code) do
      publisher
      |> Publisher.stripe_changeset(%{account_id: account_id})
      |> Core.Repo.update()
    end
  end

  def register_customer(%User{email: email} = user, source_token) do
    with {:ok, %{id: id}} <- Stripe.Customer.create(%{email: email, source: source_token}) do
      user
      |> User.stripe_changeset(%{customer_id: id})
      |> Core.Repo.update()
    end
  end

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
      Stripe.Plan.create(%{
        id:       plan.id,
        amount:   plan.cost,
        currency: "USD",
        interval: stripe_interval(plan.period),
        product: %{name: plan.name}
      }, connect_account: publisher.account_id)
    end)
    |> execute(extract: :db)
  end
  def create_plan(attrs, repo_id, user),
    do: create_plan(attrs, Repositories.get_repository!(repo_id), user)

  def create_subscription(_, _, %User{customer_id: nil}), do: {:error, "No payment method"}
  def create_subscription(%Plan{} = plan, %Installation{} = installation, %User{} = user) do
    %{repository: %{publisher: %{account_id: account_id}}} = plan =
      Core.Repo.preload(plan, [repository: :publisher])

    start_transaction()
    |> add_operation(:db, fn _ ->
      %Subscription{plan_id: plan.id, plan: plan}
      |> Subscription.changeset(%{installation_id: installation.id})
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
    |> add_operation(:stripe, fn %{customer: customer} ->
      Stripe.Subscription.create(%{
        customer: customer.id,
        application_fee_percent: conf(:application_fee),
        items: [%{plan: plan.id}]
      }, connect_account: account_id)
    end)
    |> add_operation(:finalized, fn %{stripe: %{id: sub_id}, customer: %{id: cus_id}, db: subscription} ->
      subscription
      |> Subscription.stripe_changeset(%{external_id: sub_id, customer_id: cus_id})
      |> Core.Repo.update()
    end)
    |> execute(extract: :finalized)
  end
  def create_subscription(plan_id, inst_id, %User{} = user) do
    plan = get_plan!(plan_id)
    inst = Repositories.get_installation!(inst_id)

    create_subscription(plan, inst, user)
  end

  defp stripe_interval(:monthly), do: "month"
  defp stripe_interval(:yearly), do: "year"
end