defmodule Core.Services.Accounts do
  use Core.Services.Base
  import Core.Policies.Account
  alias Core.Schema.{User, Account, Group, GroupMember, Invite}

  @type account_resp :: {:ok, Account.t} | {:error, term}
  @type group_resp :: {:ok, Group.t} | {:error, term}
  @type group_member_resp :: {:ok, GroupMember.t} | {:error, term}
  @type invite_resp :: {:ok, Invite.t} | {:error, term}

  def get_account!(id), do: Core.Repo.get!(Account, id)

  def get_group!(id), do: Core.Repo.get!(Group, id)

  def get_invite!(id), do: Core.Repo.get_by!(Invite, secure_id: id)

  def get_invite(id), do: Core.Repo.get_by(Invite, secure_id: id)

  def get_group_member(group_id, user_id),
    do: Core.Repo.get_by(GroupMember, user_id: user_id, group_id: group_id)

  @doc """
  Creates a fresh account for the user, making him the root user. Returns everything to caller
  """
  @spec create_account(User.t) :: {:ok, %{account: Account.t, user: User.t}} | {:error, term}
  def create_account(%User{email: email} = user) do
    start_transaction()
    |> add_operation(:account, fn _ ->
      %Account{}
      |> Account.changeset(%{name: email})
      |> Ecto.Changeset.change(%{root_user_id: user.id})
      |> Core.Repo.insert()
    end)
    |> add_operation(:user, fn %{account: %{id: id}} ->
      user
      |> Ecto.Changeset.change(%{account_id: id})
      |> Core.Repo.update()
    end)
    |> execute()
  end

  @doc """
  Updates the account of the user if permitted
  """
  @spec update_account(map, User.t) :: account_resp
  def update_account(attributes, %User{account_id: aid} = user) do
    get_account!(aid)
    |> Account.changeset(attributes)
    |> allow(user, :edit)
    |> when_ok(:update)
  end

  @doc """
  Creates a new invite for this account
  """
  @spec create_invite(map, User.t) :: invite_resp
  def create_invite(attributes, %User{account_id: aid} = user) do
    %Invite{account_id: aid}
    |> Invite.changeset(attributes)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  @doc """
  Accepts the invite and creates a new user
  """
  @spec realize_invite(map, binary) :: {:ok, User.t} | {:error, term}
  def realize_invite(attributes, invite_id) do
    invite = get_invite!(invite_id)

    start_transaction()
    |> add_operation(:user, fn _ ->
      %User{account_id: invite.account_id, email: invite.email}
      |> User.changeset(attributes)
      |> Core.Repo.insert()
    end)
    |> add_operation(:invite, fn _ -> Core.Repo.delete(invite) end)
    |> execute(extract: :user)
  end

  @doc """
  Creates a group in the user's account
  """
  @spec create_group(map, User.t) :: group_resp
  def create_group(attributes, %User{account_id: aid} = user) do
    start_transaction()
    |> add_operation(:group, fn _ ->
      %Group{account_id: aid}
      |> Group.changeset(attributes)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:member, fn %{group: %{id: id}} ->
      %GroupMember{group_id: id}
      |> GroupMember.changeset(%{user_id: user.id})
      |> Core.Repo.insert()
    end)
    |> execute(extract: :group)
  end

  @doc """
  Updates group attributes
  """
  @spec update_group(map, binary, User.t) :: group_resp
  def update_group(attributes, group_id, %User{} = user) do
    get_group!(group_id)
    |> Group.changeset(attributes)
    |> allow(user, :update)
    |> when_ok(:update)
  end

  @doc """
  Deletes a group
  """
  @spec delete_group(binary, User.t) :: group_resp
  def delete_group(group_id, %User{} = user) do
    get_group!(group_id)
    |> allow(user, :delete)
    |> when_ok(:delete)
  end

  @doc """
  Creates a new member in `group_id`
  """
  @spec create_group_member(map, binary, User.t) :: group_member_resp
  def create_group_member(attributes, group_id, %User{} = user) do
    %GroupMember{group_id: group_id}
    |> GroupMember.changeset(attributes)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  @doc """
  Deletes a group member by id
  """
  @spec delete_group_member(binary | GroupMember.t, User.t) :: group_member_resp
  def delete_group_member(id, %User{} = user) when is_binary(id) do
    Core.Repo.get!(GroupMember, id)
    |> delete_group_member(user)
  end

  def delete_group_member(%GroupMember{} = member, %User{} = user) do
    member
    |> allow(user, :delete)
    |> when_ok(:delete)
  end

  @spec delete_group_member(binary, binary, User.t) :: group_member_resp
  def delete_group_member(group_id, user_id, %User{} = user) do
    Core.Repo.get_by!(GroupMember, user_id: user_id, group_id: group_id)
    |> delete_group_member(user)
  end
end