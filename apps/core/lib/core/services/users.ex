defmodule Core.Services.Users do
  use Core.Services.Base
  alias Core.Schema.{User, Publisher}

  def get_user(user_id), do: Core.Repo.get(User, user_id)

  def get_publisher!(user_id),
    do: Core.Repo.get_by!(Publisher, owner_id: user_id)

  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Core.Repo.insert()
  end

  def create_publisher(attrs, %User{} = user) do
    %Publisher{owner_id: user.id}
    |> Publisher.changeset(attrs)
    |> Core.Repo.insert()
  end
end