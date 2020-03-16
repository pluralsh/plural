defmodule Watchman.Services.Users do
  use Watchman.Services.Base
  alias Watchman.Schema.{User, Invite}
  alias Watchman.Repo

  @type user_resp :: {:ok, User.t} | {:error, term}

  @spec get_user(binary) :: User.t | nil
  def get_user(id), do: Repo.get(User, id)

  @spec get_user!(binary) :: User.t
  def get_user!(id), do: Repo.get!(User, id)

  @spec get_user_by_email!(binary) :: User.t
  def get_user_by_email!(email), do: Repo.get_by!(User, email: email)

  @spec get_invite(binary) :: Invite.t | nil
  def get_invite(secure_id), do: Repo.get_by(Invite, secure_id: secure_id)

  @spec get_invite!(binary) :: Invite.t
  def get_invite!(secure_id), do: Repo.get_by!(Invite, secure_id: secure_id)

  @spec create_invite(map) :: {:ok, Invite.t} | {:error, term}
  def create_invite(attrs) do
    %Invite{}
    |> Invite.changeset(attrs)
    |> Repo.insert()
  end

  @spec update_user(map, User.t) :: user_resp
  def update_user(attrs, %User{} = user) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @spec create_user(map) :: user_resp
  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @spec create_user(map, binary | Invite.t) :: user_resp
  def create_user(attrs, %Invite{email: email}),
    do: Map.put(attrs, :email, email) |> create_user()
  def create_user(attrs, invite_id) when is_binary(invite_id),
    do: create_user(attrs, get_invite!(invite_id))

  @spec disable_user(binary, boolean, User.t) :: user_resp
  def disable_user(user_id, disable, %User{}) do
    get_user!(user_id)
    |> User.changeset(%{deleted_at: (if disable, do: Timex.now(), else: nil)})
    |> Repo.update()
  end

  @spec login_user(binary, binary) :: user_resp
  def login_user(email, password) do
    get_user_by_email!(email)
    |> validate_password(password)
  end

  defp validate_password(%User{deleted_at: nil} = user, pwd) do
    case Argon2.check_pass(user, pwd) do
      {:ok, user} -> {:ok, user}
      _ -> {:error, :invalid_password}
    end
  end
  defp validate_password(_, _), do: {:error, :disabled_user}
end