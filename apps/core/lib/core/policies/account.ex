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
    Cluster,
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

  def can?(%User{id: id}, %User{id: id}, :impersonate), do: :pass
  def can?(%User{account_id: aid, roles: %{admin: true}}, %User{account_id: aid, service_account: true}, :impersonate),
    do: :pass
  def can?(%User{account_id: aid, id: id, account: %Account{root_user_id: id}}, %User{account_id: aid, service_account: true}, :impersonate),
    do: :pass
  def can?(%User{} = user, %User{service_account: true} = sa, :impersonate) do
    with %{impersonation_policy: %{bindings: _} = policy} <- Core.Repo.preload(sa, [impersonation_policy: [:bindings]]),
          :pass <- Core.Services.Rbac.evaluate_policy(user, policy) do
      :pass
    else
      _ -> {:error, "you're not allowed to impersonate this service account, please verify your user is on its access policy"}
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

  def can?(%User{account_id: aid} = user, %GroupMember{} = group, :create) do
    case Core.Repo.preload(group, [:user, group: [:account]]) do
      %{group: group, user: %{account_id: ^aid}} -> can?(user, group, :create)
      _ -> {:error, "user not in the current account"}
    end
  end

  def can?(%User{} = user, %GroupMember{} = gm, action) do
    %{group: group} = Core.Repo.preload(gm, [:user, group: [:account]])
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

  def can?(%User{} = user, %Cluster{owner: %User{} = owner}, action),
    do: can?(user, owner, action)

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
