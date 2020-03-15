defmodule Watchman.Services.Users do
  use Watchman.Services.Base
  alias Watchman.Schema.User
  alias Watchman.Repo

  @spec get_user(binary) :: User.t | nil
  def get_user(id), do: Repo.get(User, id)

  @spec get_user!(binary) :: User.t
  def get_user!(id), do: Repo.get!(User, id)

  @spec get_user_by_email!(binary) :: User.t
  def get_user_by_email!(email), do: Repo.get_by!(User, email: email)

  @spec update_user(map, User.t) :: {:ok, User.t} | {:error, term}
  def update_user(attrs, %User{} = user) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @spec create_user(map) :: {:ok, User.t} | {:error, term}
  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @spec login_user(binary, binary) :: {:ok, User.t} | {:error, term}
  def login_user(email, password) do
    get_user_by_email!(email)
    |> Argon2.check_pass(password)
    |> case do
      {:ok, user} -> {:ok, user}
      _ -> {:error, :invalid_password}
    end
  end
end