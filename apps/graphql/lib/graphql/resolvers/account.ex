defmodule GraphQl.Resolvers.Account do
  use GraphQl.Resolvers.Base, model: Core.Schema.Account
  alias Core.Schema.{Group, GroupMember, Role, RoleBinding, IntegrationWebhook, WebhookLog}
  alias Core.Services.Accounts

  def query(Group, _), do: Group
  def query(Role, _), do: Role
  def query(RoleBinding, _), do: RoleBinding
  def query(GroupMember, _), do: GroupMember
  def query(IntegrationWebhook, _), do: IntegrationWebhook
  def query(WebhookLog, _), do: WebhookLog
  def query(_, _), do: Account

  def update_account(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Accounts.update_account(attrs, user)

  def list_groups(args, %{context: %{current_user: %{account_id: aid}}}) do
    Group.ordered()
    |> Group.for_account(aid)
    |> maybe_search(Group, args)
    |> paginate(args)
  end

  def list_group_members(%{group_id: group_id} = args, _) do
    GroupMember.for_group(group_id)
    |> paginate(args)
  end

  def list_roles(args, %{context: %{current_user: %{account_id: aid}}}) do
    Role.ordered()
    |> Role.for_account(aid)
    |> paginate(args)
  end

  def list_webhooks(args, %{context: %{current_user: %{account_id: aid}}}) do
    IntegrationWebhook.for_account(aid)
    |> IntegrationWebhook.ordered()
    |> paginate(args)
  end

  def list_webhook_logs(args, %{source: %{id: webhook_id}}) do
    WebhookLog.for_webhook(webhook_id)
    |> WebhookLog.ordered()
    |> paginate(args)
  end

  def resolve_webhook(%{id: id}, %{context: %{current_user: user}}) do
    Accounts.get_webhook!(id)
    |> Core.Policies.Account.allow(user, :access)
  end

  def resolve_role(%{id: id}, _),
    do: {:ok, Accounts.get_role(id)}

  def resolve_invite(%{id: secure_id}, _),
    do: {:ok, Accounts.get_invite(secure_id)}

  def create_invite(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Accounts.create_invite(attrs, user)

  def create_group(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Accounts.create_group(attrs, user)

  def delete_group(%{group_id: group_id}, %{context: %{current_user: user}}),
    do: Accounts.delete_group(group_id, user)

  def update_group(%{attributes: attrs, group_id: group_id}, %{context: %{current_user: user}}),
    do: Accounts.update_group(attrs, group_id, user)

  def create_group_member(%{group_id: group_id, user_id: user_id}, %{context: %{current_user: user}}),
    do: Accounts.create_group_member(%{user_id: user_id}, group_id, user)

  def delete_group_member(%{group_id: group_id, user_id: user_id}, %{context: %{current_user: user}}),
    do: Accounts.delete_group_member(group_id, user_id, user)

  def create_role(%{attributes: attrs}, %{context: %{current_user: user}}) do
    with_permissions(attrs)
    |> Accounts.create_role(user)
  end

  def update_role(%{attributes: attrs, id: id}, %{context: %{current_user: user}}) do
    with_permissions(attrs)
    |> Accounts.update_role(id, user)
  end

  def delete_role(%{id: id}, %{context: %{current_user: user}}),
    do: Accounts.delete_role(id, user)

  def create_webhook(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Accounts.create_webhook(attrs, user)

  def update_webhook(%{id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Accounts.update_webhook(attrs, id, user)

  def delete_webhook(%{id: id}, %{context: %{current_user: user}}),
    do: Accounts.delete_webhook(id, user)

  defp with_permissions(%{permissions: perms} = attrs) when is_list(perms) do
    perm_set = MapSet.new(perms)
    permissions = Role.permissions() |> Enum.map(& {&1, MapSet.member?(perm_set, &1)}) |> Enum.into(%{})
    Map.put(attrs, :permissions, permissions)
  end
  defp with_permissions(attrs), do: attrs
end
