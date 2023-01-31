defmodule GraphQl.Resolvers.Payments do
  use GraphQl.Resolvers.Base, model: Core.Schema.Subscription
  import Piazza.Utils
  alias Core.Services.{Payments, Users}
  alias Core.Schema.{PlatformPlan, PlatformSubscription, Plan, User}

  def query(Plan, _), do: Plan.ordered()
  def query(PlatformPlan, _), do: PlatformPlan
  def query(PlatformSubscription, _), do: PlatformSubscription
  def query(Subscription, _), do: Subscription

  def resolve_subscription(%{id: id}, %{context: %{current_user: user}}) do
    Payments.get_subscription!(id)
    |> Payments.allow(user)
  end

  def list_subscriptions(args, %{context: %{current_user: %{id: user_id}}}) do
    Subscription.for_user(user_id)
    |> Subscription.ordered()
    |> paginate(args)
  end

  def list_invoices(args, %{context: %{current_user: user}}) do
    Payments.list_invoices(user, to_stripe_args(args))
    |> to_connection()
  end

  def list_invoices(subscription, args, _) do
    Payments.list_invoices(subscription, to_stripe_args(args))
    |> to_connection()
  end

  def list_platform_plans(_, _) do
    PlatformPlan.visible()
    |> PlatformPlan.ordered()
    |> Core.Repo.all()
    |> ok()
  end

  def resolve_platform_subscription(_, %{context: %{current_user: %User{account_id: id}}}),
    do: {:ok, Payments.get_platform_subscription_by_account!(id)}

  def list_cards(%User{id: uid} = user, args, %{context: %{current_user: %User{id: uid}}}) do
    Payments.list_cards(user, to_stripe_args(args))
    |> to_connection()
  end
  def list_cards(_, _, _), do: {:error, :forbidden}

  defp to_connection({:ok, %Stripe.List{has_more: has_more, data: list}}) do
    {edges, end_cursor} = build_edges(list)
    page_info = %{has_next_page: has_more, end_cursor: end_cursor}
    {:ok, %{edges: Enum.reverse(edges), page_info: page_info}}
  end
  defp to_connection(error), do: error

  defp to_stripe_args(args) do
    args
    |> move_value([:after], [:starting_after])
    |> move_value([:first], [:limit])
    |> Map.take(~w(starting_after limit)a)
  end

  defp build_edges(items) do
    Enum.reduce(items, {[], nil}, fn %{id: id} = node, {l, _} ->
      {[%{node: node, cursor: id} | l], id}
    end)
  end

  def create_subscription(
    %{attributes: attrs, plan_id: plan_id, installation_id: inst_id},
    %{context: %{current_user: user}}
  ), do: Payments.create_subscription(attrs, plan_id, inst_id, user)
  def create_subscription(%{plan_id: plan_id, installation_id: inst_id}, %{context: %{current_user: user}}),
    do: Payments.create_subscription(plan_id, inst_id, user)

  def create_card(%{source: source}, %{context: %{current_user: user}}),
    do: Payments.create_card(user, source)

  def delete_card(%{id: id}, %{context: %{current_user: user}}),
    do: Payments.delete_card(id, user)

  def create_plan(%{attributes: attrs, repository_id: id}, %{context: %{current_user: user}}),
    do: Payments.create_plan(attrs, id, user)

  def update_plan_attributes(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Payments.update_plan_attributes(attrs, id, user)

  def update_line_item(%{attributes: attrs, subscription_id: id}, %{context: %{current_user: user}}),
    do: Payments.update_line_item(attrs, id, user)

  def update_plan(%{plan_id: plan_id, subscription_id: id}, %{context: %{current_user: user}}),
    do: Payments.update_plan(plan_id, id, user)

  def create_platform_subscription(%{plan_id: id}, %{context: %{current_user: user}}),
    do: Payments.create_platform_subscription(id, user)

  def delete_platform_subscription(_, %{context: %{current_user: user}}),
    do: Payments.delete_platform_subscription(user)

  def update_platform_plan(%{plan_id: id}, %{context: %{current_user: user}}),
    do: Payments.update_platform_plan(id, user)

  def cancel_platform_subscription(_, %{context: %{current_user: user}}),
    do: Payments.cancel_platform_subscription(user)

  def link_publisher(%{token: token}, %{context: %{current_user: user}}) do
    Users.get_publisher_by_owner!(user.id)
    |> Payments.create_publisher_account(token)
  end
end
