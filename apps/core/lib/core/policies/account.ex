defmodule Core.Policies.Account do
  use Piazza.Policy
  alias Core.Schema.{User, Account, Group, GroupMember, Invite, Role}

  def can?(%User{id: id}, %Account{root_user_id: id}, _), do: :pass

  def can?(%User{} = user, %Group{} = group, action) do
    %{account: account} = Core.Repo.preload(group, [:account])
    can?(user, account, action)
  end

  def can?(%User{} = user, %Role{} = role, action) do
    %{account: account} = Core.Repo.preload(role, [:account])
    can?(user, account, action)
  end

  def can?(%User{} = user, %Invite{} = group, action) do
    %{account: account} = Core.Repo.preload(group, [:account])
    can?(user, account, action)
  end

  def can?(%User{} = user, %GroupMember{} = group, action) do
    %{group: group} = Core.Repo.preload(group, [group: :account])
    can?(user, group, action)
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end