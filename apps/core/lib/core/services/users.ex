defmodule Core.Services.Users do
  use Core.Services.Base
  alias Core.Schema.{User, Publisher}

  def get_user(user_id), do: Core.Repo.get(User, user_id)

  def get_user_by_email!(email),
    do: Core.Repo.get_by!(User, email: email)

  def get_publisher!(id),
    do: Core.Repo.get!(Publisher, id)

  def get_publisher_by_owner!(owner_id),
    do: Core.Repo.get_by!(Publisher, owner_id: owner_id)

  def get_publisher_by_owner(owner_id),
    do: Core.Repo.get_by(Publisher, owner_id: owner_id)

  def get_publisher_by_name!(name),
    do: Core.Repo.get_by!(Publisher, name: name)

  def login_user(email, password) do
    get_user_by_email!(email)
    |> Argon2.check_pass(password)
    |> case do
      {:ok, user} -> {:ok, user}
      _ -> {:error, :invalid_password}
    end
  end

  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Core.Repo.insert()
  end

  def update_user(attrs, %User{} = user) do
    user
    |> User.changeset(attrs)
    |> Core.Repo.update()
  end

  def create_publisher(attrs, %User{} = user) do
    %Publisher{owner_id: user.id}
    |> Publisher.changeset(attrs)
    |> Core.Repo.insert()
  end

  def update_publisher(attrs, %User{} = user) do
    get_publisher_by_owner!(user.id)
    |> Publisher.changeset(attrs)
    |> Core.Repo.update()
  end
end