defmodule Core.Services.Users do
  use Core.Services.Base
  import Core.Policies.User
  alias Core.Services.{Accounts}
  alias Core.PubSub
  alias Core.Schema.{
    PersistedToken,
    User,
    Publisher,
    Webhook,
    Notification,
    ResetToken,
    PublicKey,
    PasswordlessLogin,
    LoginToken
  }

  @spec get_user(binary) :: User.t | nil
  def get_user(user_id), do: Core.Repo.get(User, user_id)

  @spec  get_user_by_email!(binary) :: User.t
  def get_user_by_email!(email),
    do: Core.Repo.get_by!(User, email: email)

  @spec  get_user_by_email(binary) :: User.t | nil
  def get_user_by_email(email),
    do: Core.Repo.get_by(User, email: email)

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

  @spec get_public_key!(binary) :: PublicKey.t
  def get_public_key!(id), do: Core.Repo.get!(PublicKey, id)

  @spec get_login_token(binary) :: LoginToken.t | nil
  def get_login_token(token), do: Core.Repo.get_by(LoginToken, token: token)

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
  Realizes a passwordless login
  """
  @spec passwordless_login(binary) :: {:ok, User.t} | {:error, :invalid_token}
  def passwordless_login(token) do
    start_transaction()
    |> add_operation(:login, fn _ ->
      Core.Repo.get_by(PasswordlessLogin, token: token)
      |> Core.Repo.preload([:user])
      |> case do
        %PasswordlessLogin{} = l -> {:ok, l}
        _ -> {:error, :not_found}
      end
    end)
    |> add_operation(:token, fn %{login: %{login_token_id: id}} ->
      Core.Repo.get(LoginToken, id)
      |> LoginToken.changeset(%{active: true})
      |> Core.Repo.update()
    end)
    |> add_operation(:delete, fn %{login: login} -> Core.Repo.delete(login) end)
    |> add_operation(:user, fn %{login: %{user: user}} -> {:ok, user} end)
    |> execute(extract: :user)
  end

  def poll_login_token(token) do
    start_transaction()
    |> add_operation(:token, fn _ ->
      Core.Repo.get_by(LoginToken, token: token)
      |> Core.Repo.preload([:user])
      |> case do
        %LoginToken{active: true} = token -> {:ok, token}
        %LoginToken{} -> {:error, :inactive}
        nil -> {:error, :not_found}
      end
    end)
    |> add_operation(:rm , fn %{token: token} -> Core.Repo.delete(token) end)
    |> execute(extract: :token)
    |> when_ok(& {:ok, Map.get(&1, :user)})
  end

  @doc """
  Determines the login method for a user and triggers any necessary background processing
  """
  @spec login_method(binary) :: {:ok, %{login_method: atom}} | {:error, term}
  def login_method(email) do
    with %User{login_method: method} = user <- get_user_by_email(email),
         {:ok, login} <- handle_login_method(user) do
      {:ok, build_login_method(method, login)}
    else
      _ -> {:error, :not_found}
    end
  end

  defp build_login_method(method, %{token: token}), do: %{login_method: method, token: token}
  defp build_login_method(method, _), do: %{login_method: method}

  defp handle_login_method(%User{login_method: :passwordless} = user) do
    start_transaction()
    |> add_operation(:token, fn _ ->
      %LoginToken{}
      |> LoginToken.changeset(%{user_id: user.id})
      |> Core.Repo.insert()
    end)
    |> add_operation(:passwordless, fn %{token: %{id: id}} ->
      %PasswordlessLogin{}
      |> PasswordlessLogin.changeset(%{user_id: user.id, login_token_id: id})
      |> Core.Repo.insert()
    end)
    |> execute()
    |> case do
      {:ok, %{passwordless: pwdless, token: token}} ->
        notify({:ok, pwdless}, :create)
        {:ok, token}
      error -> error
    end
  end
  defp handle_login_method(_), do: {:ok, :ignore}

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

  @doc "self explanatory"
  @spec create_public_key(map, User.t) :: {:ok, PublicKey.t} | {:error, term}
  def create_public_key(attrs, %User{} = user) do
    %PublicKey{user_id: user.id}
    |> PublicKey.changeset(attrs)
    |> Core.Repo.insert()
  end

  @doc """
  Deletes a public key, and fails if it's owned by a different user
  """
  @spec delete_public_key(binary, User.t) :: {:ok, PublicKey.t} | {:error, term}
  def delete_public_key(id, %User{} = user) do
    get_public_key!(id)
    |> allow(user, :delete)
    |> when_ok(:delete)
  end

  @doc """
  Creates a new user
  """
  @spec create_user(map) :: {:ok, User.t} | {:error, term}
  def create_user(attrs) do
    start_transaction()
    |> add_operation(:pre, fn _ ->
      confirm_by = Timex.now() |> Timex.shift(days: 7)
      %User{email_confirm_by: confirm_by}
      |> User.changeset(attrs)
      |> Core.Repo.insert()
    end)
    |> add_operation(:user, fn %{pre: user} ->
      with {:ok, %{user: user}} <- Accounts.create_account(user),
        do: {:ok, user}
    end)
    |> execute(extract: :user)
    |> notify(:create)
  end

  @doc "self explanatory"
  @spec update_user(map, User.t) :: {:ok, User.t} | {:error, term}
  def update_user(attrs, %User{} = user) do
    user
    |> User.changeset(attrs)
    |> Core.Repo.update()
    |> notify(:update)
  end

  @doc """
  Creates a new publisher for the acting user.
  """
  @spec create_publisher(map, User.t) :: {:ok, Publisher.t} | {:error, term}
  def create_publisher(attrs, %User{} = user) do
    %Publisher{owner_id: user.id, account_id: user.account_id}
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

  def realize_reset_token(%ResetToken{type: :email, user: %User{} = user}, _) do
    user
    |> Ecto.Changeset.change(%{email_confirmed: true})
    |> Core.Repo.update()
    |> notify(:confirmed)
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
  def notify({:ok, %PasswordlessLogin{} = l}, :create),
    do: handle_notify(PubSub.PasswordlessLoginCreated, l)
  def notify({:ok, %User{} = u}, :update),
    do: handle_notify(PubSub.UserUpdated, u)
  def notify({:ok, %User{} = u}, :create),
    do: handle_notify(PubSub.UserCreated, u)
  def notify({:ok, %User{} = u}, :confirmed),
    do: handle_notify(PubSub.EmailConfirmed, u)

  def notify(error, _), do: error
end
