defmodule Watchman.GraphQl.Resolvers.User do
  use Watchman.GraphQl.Resolvers.Base, model: Watchman.Schema.User
  alias Watchman.Services.Users

  def list_users(args, _) do
    User.ordered()
    |> paginate(args)
  end

  def resolve_invite(%{id: secure_id}, _) do
    {:ok, Users.get_invite(secure_id)}
  end

  def signin_user(%{email: email, password: password}, _) do
    Users.login_user(email, password)
    |> with_jwt()
  end

  def signup_user(%{invite_id: invite_id, attributes: attrs}, _) do
    Users.create_user(attrs, invite_id)
    |> with_jwt()
  end

  def update_user(%{attributes: attrs}, %{context: %{current_user: user}}) do
    Users.update_user(attrs, user)
  end

  def create_invite(%{attributes: attrs}, _),
    do: Users.create_invite(attrs)

  @colors ~w(#6b5b95 #d64161 #ff7b25 #103A50 #CDCCC2 #FDC401 #8E5B3C #020001 #2F415B)

  def background_color(%{id: id}) do
    stripped = String.replace(id, "-", "")
    {integral, _} = Integer.parse(stripped, 16)
    {:ok, Enum.at(@colors, rem(integral, length(@colors)))}
  end

  defp with_jwt({:ok, user}) do
    with {:ok, token, _} <- Watchman.Guardian.encode_and_sign(user),
        do: {:ok, %{user | jwt: token}}
  end
  defp with_jwt(error), do: error
end