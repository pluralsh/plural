defmodule GraphQl.Resolvers.User do
  use GraphQl.Resolvers.Base, model: Core.Schema.User
  alias Core.Services.Users
  alias Core.Schema.{Publisher, PersistedToken, Webhook}

  def query(Publisher, _), do: Publisher
  def query(Webhook, _), do: Webhook
  def query(_, _), do: User

  def resolve_publisher(%{id: id}, _),
    do: {:ok, Users.get_publisher!(id)}
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

  def list_tokens(args, %{context: %{current_user: user}}) do
    PersistedToken.for_user(user.id)
    |> PersistedToken.ordered()
    |> paginate(args)
  end

  def list_webhooks(args, %{context: %{current_user: user}}) do
    Webhook.for_user(user.id)
    |> Webhook.ordered()
    |> paginate(args)
  end

  def create_webhook(%{attributes: %{url: url}}, %{context: %{current_user: user}}),
    do: Users.upsert_webhook(url, user)

  def create_token(_, %{context: %{current_user: user}}),
    do: Users.create_persisted_token(user)

  def delete_token(%{id: id}, %{context: %{current_user: user}}),
    do: Users.delete_persisted_token(id, user)

  def login_user(%{email: email, password: pwd}, _) do
    Users.login_user(email, pwd)
    |> with_jwt()
  end

  def signup_user(%{attributes: attrs}, _) do
    Users.create_user(attrs)
    |> with_jwt()
  end

  def ping_webhook(%{repo: repo, id: webhook_id} = args, _) do
    webhook = Users.get_webhook!(webhook_id)

    Core.Services.Users.post_webhook(%{
      repository: repo,
      message: Map.get(args, :message, "webhook ping")
    }, webhook)
    |> case do
      {:ok, %{body: body, status_code: code, headers: headers}} when is_list(headers) ->
        {:ok, %{body: body, status_code: code, headers: Map.new(headers)}}
      error -> error
    end
  end

  def update_user(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Users.update_user(attrs, user)

  def create_publisher(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Users.create_publisher(attrs, user)

  def update_publisher(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Users.update_publisher(attrs, user)

  @colors ~w(#6b5b95 #feb236 #d64161 #ff7b25 #103A50 #CDCCC2 #FDC401 #8E5B3C #020001 #2F415B)

  def background_color(%{id: id}) do
    stripped = String.replace(id, "-", "")
    {integral, _} = Integer.parse(stripped, 16)
    Enum.at(@colors, rem(integral, length(@colors)))
  end

  defp with_jwt({:ok, user}) do
    with {:ok, token, _} <- Core.Guardian.encode_and_sign(user),
        do: {:ok, %{user | jwt: token}}
  end
  defp with_jwt(error), do: error
end