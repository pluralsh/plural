defmodule Core.Policies.Account do
  use Piazza.Policy
  import Core.Policies.Utils
  alias Core.Schema.{
    User,
    Account,
    Group,
    GroupMember,
    Invite,
    Role,
    IntegrationWebhook,
    OAuthIntegration
  }

  def can?(%User{id: id}, %Account{root_user_id: id}, _), do: :pass
  def can?(%User{account_id: id, roles: %{admin: true}}, %Account{id: id}, _), do: :pass

  def can?(%User{} = user, %Group{} = group, _) do
    %{account: account} = Core.Repo.preload(group, [:account])
    check_rbac(user, :users, account: account)
  end

  def can?(%User{account_id: id} = user, %User{account_id: id}, :create) do
    %{account: account} = Core.Repo.preload(user, [:account])
    check_rbac(user, :users, account: account)
  end

  def can?(%User{} = user, %User{service_account: true} = sa, :impersonate) do
    %{groups: user_groups} = Core.Repo.preload(user, [:groups])
    %{impersonation_policy: %{bindings: bindings}} =
      Core.Repo.preload(sa, [impersonation_policy: [:bindings]])

    {users, groups} = Enum.split_with(bindings, & &1.user_id)
    group_set = Enum.map(groups, & &1.group_id) |> MapSet.new()
    user_group_set = Enum.map(user_groups, & &1.id) |> MapSet.new()

    with false <- Enum.any?(users, & &1.user_id == user.id),
         true <- MapSet.disjoint?(group_set, user_group_set) do
      {:error, "you're not allowed to impersonate this service account, please verify your user is on its access policy"}
    else
      _ -> :pass
    end
  end

  def can?(%User{} = user, %Role{} = role, _) do
    %{account: account} = Core.Repo.preload(role, [:account])
    check_rbac(user, :users, account: account)
  end

  def can?(%User{} = user, %Invite{} = group, _) do
    %{account: account} = Core.Repo.preload(group, [:account])
    check_rbac(user, :users, account: account)
  end

  def can?(%User{} = user, %GroupMember{} = group, action) do
    %{group: group} = Core.Repo.preload(group, [group: :account])
    can?(user, group, action)
  end

  def can?(%User{account_id: aid}, %IntegrationWebhook{account_id: aid}, :access),
    do: :pass

  def can?(%User{} = user, %IntegrationWebhook{} = webhook, _) do
    %{account: account} = Core.Repo.preload(webhook, [:account])
    check_rbac(user, :integrations, account: account)
  end

  def can?(%User{} = user, %OAuthIntegration{} = oauth, _) do
    %{account: account} = Core.Repo.preload(oauth, [:account])
    check_rbac(user, :integrations, account: account)
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
