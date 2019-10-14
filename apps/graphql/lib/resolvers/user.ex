defmodule GraphQl.Resolvers.User do
  use GraphQl.Resolvers.Base, model: Core.Schema.User
  alias Core.Services.Users
  alias Core.Schema.Publisher

  def query(Publisher, _), do: Publisher
  def query(_, _), do: User

  def resolve_publisher(_, %{context: %{current_user: user}}),
    do: {:ok, Users.get_publisher_by_owner(user.id)}

  def list_users(args, _) do
    User.ordered()
    |> paginate(args)
  end

  def list_publishers(args, _) do
    Publisher.ordered()
    |> paginate(args)
  end

  def login_user(%{email: email, password: pwd}, _),
    do: Users.login_user(email, pwd)

  def signup_user(%{attributes: args}, _),
    do: Users.create_user(args)
end