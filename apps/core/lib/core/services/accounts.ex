defmodule Core.Services.Accounts do
  use Core.Services.Base
  import Core.Policies.Account
  alias Core.Schema.{User, Account, Group, GroupMember, Invite, Role, IntegrationWebhook}

  @type account_resp :: {:ok, Account.t} | {:error, term}
  @type group_resp :: {:ok, Group.t} | {:error, term}
  @type group_member_resp :: {:ok, GroupMember.t} | {:error, term}
  @type invite_resp :: {:ok, Invite.t} | {:error, term}
  @type role_resp :: {:ok, Role.t} | {:error, term}
  @type webhook_resp :: {:ok, IntegrationWebhook.t} | {:error, term}

  def get_account!(id), do: Core.Repo.get!(Account, id)

  def get_group!(id), do: Core.Repo.get!(Group, id)

  def get_invite!(id), do: Core.Repo.get_by!(Invite, secure_id: id)

  def get_invite(id), do: Core.Repo.get_by(Invite, secure_id: id)

  def get_role(id), do: Core.Repo.get(Role, id)

  def get_role!(id), do: Core.Repo.get!(Role, id)

  def get_webhook!(id), do: Core.Repo.get!(IntegrationWebhook, id)

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

  @doc """
  Creates a new role in the user's account
  """
  @spec create_role(map, User.t) :: role_resp
  def create_role(attrs, %User{account_id: id} = user) do
    %Role{account_id: id}
    |> Role.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  @doc """
  Updates a role by id
  """
  @spec update_role(map, binary, User.t) :: role_resp
  def update_role(attrs, id, %User{} = user) do
    get_role!(id)
    |> Core.Repo.preload([:role_bindings])
    |> Role.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
  end

  @doc """
  Deletes a role by id
  """
  @spec delete_role(binary, User.t) :: role_resp
  def delete_role(id, user) do
    get_role!(id)
    |> allow(user, :delete)
    |> when_ok(:delete)
  end


  @doc """
  Creates a new integration webhook for this account
  """
  @spec create_webhook(map, User.t) :: webhook_resp
  def create_webhook(attrs, %User{account_id: account_id} = user) do
    %IntegrationWebhook{account_id: account_id}
    |> IntegrationWebhook.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  @doc """
  Updates an integration webhook
  """
  @spec update_webhook(map, binary, User.t) :: webhook_resp
  def update_webhook(attrs, webhook_id, user) do
    get_webhook!(webhook_id)
    |> IntegrationWebhook.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
  end

  @doc """
  Deletes an integration webhook
  """
  @spec delete_webhook(binary, User.t) :: webhook_resp
  def delete_webhook(webhook_id, user) do
    get_webhook!(webhook_id)
    |> allow(user, :edit)
    |> when_ok(:delete)
  end

  @doc """
  Makes a signed http POST to the given webhook url, with the payload:
  """
  @spec post_webhook(map, IntegrationWebhook.t) :: {:ok, %HTTPoison.Response{}} | {:error, term}
  def post_webhook(message, %IntegrationWebhook{url: url, secret: secret}) do
    time      = :os.system_time(:millisecond)
    payload   = Jason.encode!(message)
    signature = hmac(secret, "#{payload}\n#{time}")

    headers   = [
      {"content-type", "application/json"},
      {"accept", "application/json"},
      {"x-forge-signature", "sha1=#{signature}"},
      {"x-forge-timestamp", "#{time}"}
    ]
    HTTPoison.post(url, headers, payload)
  end

  def hmac(secret, payload) when is_binary(payload) do
    :crypto.hmac(:sha, secret, payload)
    |> Base.encode16(case: :lower)
  end
end
