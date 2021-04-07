defmodule Core.Services.Users do
  use Core.Services.Base
  import Core.Policies.User
  alias Core.Services.{Accounts, Upgrades}
  alias Core.PubSub
  alias Core.Schema.{
    PersistedToken,
    User,
    Publisher,
    Webhook,
    Notification,
    ResetToken,
  }

  @spec get_user(binary) :: User.t | nil
  def get_user(user_id), do: Core.Repo.get(User, user_id)

  @spec  get_user_by_email!(binary) :: User.t
  def get_user_by_email!(email),
    do: Core.Repo.get_by!(User, email: email)

  @spec get_publisher!(binary) :: Publisher.t
  def get_publisher!(id),
    do: Core.Repo.get!(Publisher, id)

  @spec get_publisher_by_owner!(binary) :: Publisher.t
  def get_publisher_by_owner!(owner_id),
    do: Core.Repo.get_by!(Publisher, owner_id: owner_id)

  @spec get_publisher_by_owner(binary) :: Publisher.t | nil
  def get_publisher_by_owner(owner_id),
    do: Core.Repo.get_by(Publisher, owner_id: owner_id)

  @spec get_publisher_by_name!(binary) :: Publisher.t
  def get_publisher_by_name!(name),
    do: Core.Repo.get_by!(Publisher, name: name)

  @spec get_persisted_token(binary) :: PersistedToken.t | nil
  def get_persisted_token(token) do
    Core.Repo.get_by!(PersistedToken, token: token)
    |> Core.Repo.preload([:user])
  end

  @spec get_webhook!(binary) :: Webhook.t
  def get_webhook!(id), do: Core.Repo.get!(Webhook, id)

  @spec get_reset_token!(binary) :: ResetToken.t
  def get_reset_token!(ext_id), do: Core.Repo.get_by!(ResetToken, external_id: ext_id)

  @doc """
  Validates the given password using Argon2
  """
  @spec login_user(binary, binary) :: {:ok, User.t} | {:error, :invalid_password}
  def login_user(email, password) do
    get_user_by_email!(email)
    |> Argon2.check_pass(password)
    |> case do
      {:ok, user} -> {:ok, user}
      _ -> {:error, :invalid_password}
    end
  end

  @doc """
  Creates a new persisted token for the user which can substitute for jwt bearer
  tokens for use in the forge cli.
  """
  @spec create_persisted_token(User.t) :: {:ok, PersistedToken.t} | {:error, term}
  def create_persisted_token(%User{} = user) do
    %PersistedToken{}
    |> PersistedToken.changeset(%{user_id: user.id})
    |> Core.Repo.insert()
  end

  @doc "self explanatory"
  @spec delete_persisted_token(binary, User.t) :: {:ok, PersistedToken.t} | {:error, term}
  def delete_persisted_token(token_id, %User{} = user) do
    Core.Repo.get!(PersistedToken, token_id)
    |> allow(user, :edit)
    |> when_ok(:delete)
  end

  @doc """
  Creates a new user
  """
  @spec create_user(map) :: {:ok, User.t} | {:error, term}
  def create_user(attrs) do
    start_transaction()
    |> add_operation(:pre, fn _ ->
      %User{}
      |> User.changeset(attrs)
      |> Core.Repo.insert()
    end)
    |> add_operation(:user, fn %{pre: user} ->
      with {:ok, %{user: user}} <- Accounts.create_account(user),
        do: {:ok, user}
    end)
    |> add_operation(:queue, fn %{user: user} -> Upgrades.create_queue(user) end)
    |> execute(extract: :user)
  end

  @doc "self explanatory"
  @spec update_user(map, User.t) :: {:ok, User.t} | {:error, term}
  def update_user(attrs, %User{} = user) do
    user
    |> User.changeset(attrs)
    |> Core.Repo.update()
  end

  @doc """
  Creates a new publisher for the acting user.
  """
  @spec create_publisher(map, User.t) :: {:ok, Publisher.t} | {:error, term}
  def create_publisher(attrs, %User{} = user) do
    %Publisher{owner_id: user.id}
    |> Publisher.changeset(attrs)
    |> Core.Repo.insert()
  end

  @doc """
  Updates the acting user's publisher
  """
  @spec update_publisher(map, User.t) :: {:ok, Publisher.t} | {:error, term}
  def update_publisher(attrs, %User{} = user) do
    get_publisher_by_owner!(user.id)
    |> Publisher.changeset(attrs)
    |> Core.Repo.update()
  end

  @doc """
  Deletes the notifications for the current user, with filtering options
  """
  @spec read_notifications(map, User.t) :: {integer, term}
  def read_notifications(args, %User{} = user) do
    Notification.for_user(user.id)
    |> filter_notifications(args)
    |> Core.Repo.delete_all()
  end

  defp filter_notifications(query, %{incident_id: id}) when is_binary(id),
    do: Notification.for_incident(query, id)
  defp filter_notifications(query, _), do: query

  @doc """
  Creates or updates a new webhook for `url` and the given user
  """
  @spec upsert_webhook(binary, User.t) :: {:ok, Webhook.t} | {:error, term}
  def upsert_webhook(url, %User{id: user_id}) do
    case Core.Repo.get_by(Webhook, url: url, user_id: user_id) do
      %Webhook{} = webhook -> {:ok, webhook}
      nil -> %Webhook{user_id: user_id} |> Webhook.changeset(%{url: url}) |> Core.Repo.insert()
    end
  end

  @doc """
  Creates a reset token for a user which can be used for things like password resets
  """
  @spec create_reset_token(map) :: {:ok, ResetToken.t} | {:error, term}
  def create_reset_token(attrs) do
    start_transaction()
    |> add_operation(:token, fn _ ->
      %ResetToken{}
      |> ResetToken.changeset(attrs)
      |> Core.Repo.insert()
    end)
    |> add_operation(:valid, fn %{token: token} ->
      case Core.Repo.preload(token, [:user]) do
        %{user: %User{}} = token -> {:ok, token}
        _ -> {:error, :not_found}
      end
    end)
    |> execute(extract: :valid)
    |> notify(:create)
  end

  @doc """
  Performs whatever action the reset token is meant to represent
  """
  @spec realize_reset_token(ResetToken.t, map) :: {:ok, User.t} | {:error, term}
  def realize_reset_token(%ResetToken{type: :password, user: %User{} = user}, %{password: pwd}) do
    user
    |> User.changeset(%{password: pwd})
    |> Core.Repo.update()
  end

  def realize_reset_token(id, args) when is_binary(id) do
    get_reset_token!(id)
    |> Core.Repo.preload([:user])
    |> realize_reset_token(args)
  end

  @doc """
  Makes a signed http POST to the given webhook url, with the payload:

  ```
  {"repo": `repo`}
  ```
  """
  @spec post_webhook(map, Webhook.t) :: {:ok, %Mojito.Response{}} | {:error, term}
  def post_webhook(message, %Webhook{url: url, secret: secret}) do
    payload   = Jason.encode!(message)
    signature = hmac(secret, payload)
    headers   = [
      {"content-type", "application/json"},
      {"accept", "application/json"},
      {"x-watchman-signature", "sha1=#{signature}"}
    ]
    Mojito.post(sanitize(url), headers, payload, pool: false)
  end

  defp sanitize("https://" <> _ = url), do: url
  defp sanitize("http://" <> rest), do: "https://#{rest}"
  defp sanitize(url), do: "https://" <> url

  def hmac(secret, payload) when is_binary(payload) do
    :crypto.hmac(:sha, secret, payload)
    |> Base.encode16(case: :lower)
  end

  def notify({:ok, %ResetToken{} = t}, :create),
    do: handle_notify(PubSub.ResetTokenCreated, t)
  def notify(error, _), do: error
end
