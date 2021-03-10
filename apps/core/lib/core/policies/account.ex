defmodule Core.Policies.Account do
  use Piazza.Policy
  import Core.Policies.Utils
  alias Core.Schema.{User, Account, Group, GroupMember, Invite, Role, IntegrationWebhook, OAuthIntegration}

  def can?(%User{id: id}, %Account{root_user_id: id}, _), do: :pass

  def can?(%User{} = user, %Group{} = group, _) do
    %{account: account} = Core.Repo.preload(group, [:account])
    check_rbac(user, :users, account: account)
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
