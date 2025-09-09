defmodule Core.Services.Users do
  use Core.Services.Base
  use Nebulex.Caching
  import Core.Policies.User
  alias Core.Services.{Accounts, Dns, Shell.Demo}
  alias Core.Clients.ZeroSSL
  alias Core.PubSub
  alias Core.Schema.{
    Account,
    PersistedToken,
    User,
    Publisher,
    Webhook,
    Notification,
    ResetToken,
    PublicKey,
    PasswordlessLogin,
    LoginToken,
    DeviceLogin,
    EabCredential,
    DomainMapping,
    UserEvent,
    OIDCTrustRelationship
  }

  @type error :: {:error, term}
  @type user_resp :: {:ok, User.t} | error
  @type trust_resp :: {:ok, OIDCTrustRelationship.t} | error

  @ttl :timer.hours(12)

  @spec for_emails([binary]) :: [User.t]
  def for_emails(emails) do
    User.for_emails(emails)
    |> Core.Repo.all()
  end

  @spec get_user(binary) :: User.t | nil
  def get_user(user_id), do: Core.Repo.get(User, user_id)

  @spec get_user!(binary) :: User.t
  def get_user!(user_id), do: Core.Repo.get!(User, user_id)

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
    Core.Repo.get_by(PersistedToken, token: token)
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
  Fetches a user from an auth token, handles:
  * persisted api tokens
  * jwt
  """
  @spec from_token(binary) :: user_resp
  def from_token("plrl-" <> _ = token), do: resolve_persisted_token(token)
  def from_token("cmt-" <> _ = token), do: resolve_persisted_token(token)
  def from_token(token) when is_binary(token) do
    case Core.Guardian.resource_from_token(token) do
      {:ok, user, _} -> {:ok, user}
      error -> error
    end
  end

  defp resolve_persisted_token(token) do
    case get_persisted_token(token) do
      %PersistedToken{user: %User{} = user} -> {:ok, user}
      _ -> {:error, "could not resolve persisted token"}
    end
  end

  @doc """
  Determines if a user can view details of another user
  """
  @spec accessible(User.t | binary, User.t) :: user_resp
  def accessible(%User{} = user, %User{} = actor), do: allow(user, actor, :access)
  def accessible(user_id, %User{} = user) when is_binary(user_id) do
    get_user!(user_id)
    |> Core.Services.Rbac.preload()
    |> accessible(user)
  end

  @doc """
  Validates the given password using Argon2
  """
  @spec login_user(binary | User.t, binary) :: user_resp
  def login_user(email, password) when is_binary(email) do
    get_user_by_email!(email)
    |> login_user(password)
  end
  def login_user(%User{login_method: :password} = user, password) do
    case Argon2.check_pass(user, password) do
      {:ok, user} -> {:ok, user}
      _ -> {:error, "invalid password"}
    end
  end
  def login_user(_, _), do: {:error, "user has disabled password login"}

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

  @doc """
  Checks if a login token is active, and if so, discards it and returns its user
  """
  @spec poll_login_token(binary) :: user_resp
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
  @spec login_method(binary) :: {:ok, %{login_method: atom}} | error
  def login_method(email, host \\ nil) do
    with nil <- determine_sso(email, host),
         %User{login_method: method} = user <- get_user_by_email(email),
         {:ok, login} <- handle_login_method(user) do
      {:ok, build_login_method(method, login, host)}
    else
      {:sso, url} -> {:ok, %{login_method: :sso, authorize_url: url}}
      _ -> {:error, :not_found}
    end
  end

  @doc """
  Registers a new trust relationship for the given user
  """
  @spec create_trust_relationship(map, User.t) :: trust_resp
  def create_trust_relationship(attrs, %User{id: user_id}) do
    %OIDCTrustRelationship{user_id: user_id}
    |> OIDCTrustRelationship.changeset(attrs)
    |> Core.Repo.insert()
  end

  @doc """
  Deletes a trust relationship attached to the current user
  """
  @spec delete_trust_relationship(binary, User.t) :: trust_resp
  def delete_trust_relationship(id, %User{} = user) do
    Core.Repo.get(OIDCTrustRelationship, id)
    |> allow(user, :delete)
    |> when_ok(:delete)
  end

  @oidc_providers ~w(github_actions)a

  def oidc_providers(), do: @oidc_providers

  @doc """
  Generates a valid plural api jwt given validated claims from a supported oidc provider.  We will
  validate existing trust relationships first before issuing this to ensure it was sourced as expected
  """
  @spec oidc_token(atom, binary, binary) :: {:ok, binary, map} | error
  def oidc_token(provider, token, email) when is_binary(token) do
    case OpenIDConnect.verify(provider, token) do
      {:ok, claims} -> oidc_token(claims, email)
      _ -> {:error, "unable to verify id token"}
    end
  end

  def oidc_token(%{"iss" => issuer, "sub" => sub}, email) do
    %User{id: user_id} = user = get_user_by_email!(email)

    OIDCTrustRelationship.for_user(user_id)
    |> OIDCTrustRelationship.for_issuer(issuer)
    |> Core.Repo.all()
    |> Enum.find(&OIDCTrustRelationship.allow?(&1, sub))
    |> case do
      %OIDCTrustRelationship{scopes: scopes} ->
        Core.Guardian.encode_and_sign(user, %{"scopes" => scopes})
      _ -> {:error, "untrusted claims for oidc handshake"}
    end
  end

  defp build_login_method(method, %{token: token}, _), do: %{login_method: method, token: token}
  defp build_login_method(:github, _, host),
    do: %{login_method: :github, authorize_url: Core.OAuth.Github.authorize_url!(host)}
  defp build_login_method(:google, _, host),
    do: %{login_method: :google, authorize_url: Core.OAuth.Google.authorize_url!(host)}
  defp build_login_method(method, _, _), do: %{login_method: method}

  defp determine_sso(email, host) do
    with %DomainMapping{enable_sso: true, workos_connection_id: id} <- Accounts.get_mapping_for_email(email),
         {:ok, url} <- WorkOS.SSO.get_authorization_url(%{connection: id, redirect_uri: Core.OAuth.SSO.redirect_url(host)}) do
      {:sso, url}
    else
      _ -> nil
    end
  end

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
  Handles a WorkOS sso callback
  """
  @spec sso_callback(binary) :: user_resp
  def sso_callback(code) do
    with {:ok, %{"profile" => profile}} <- WorkOS.SSO.get_profile(code),
         user <- Core.OAuth.SSO.normalize(profile),
      do: bootstrap_user(:sso, user)
  end

  @doc """
  Returns the first persisted token for a user, or creates one
  """
  @spec access_token(User.t) :: {:ok, PersistedToken.t} | error
  def access_token(%User{} = user) do
    # TODO: add a limit to this query
    PersistedToken.for_user(user.id)
    |> Core.Repo.all()
    |> case do
      [token | _] -> {:ok, token}
      _ -> create_persisted_token(user)
    end
  end

  @doc """
  Creates a new persisted token for the user which can substitute for jwt bearer
  tokens for use in the forge cli.
  """
  @spec create_persisted_token(User.t) :: {:ok, PersistedToken.t} | error
  def create_persisted_token(%User{} = user) do
    %PersistedToken{}
    |> PersistedToken.changeset(%{user_id: user.id})
    |> Core.Repo.insert()
    |> notify(:create, user)
  end

  @doc "self explanatory"
  @spec delete_persisted_token(binary, User.t) :: {:ok, PersistedToken.t} | error
  def delete_persisted_token(token_id, %User{} = user) do
    Core.Repo.get!(PersistedToken, token_id)
    |> allow(user, :edit)
    |> when_ok(:delete)
  end

  @doc "self explanatory"
  @spec create_public_key(map, User.t) :: {:ok, PublicKey.t} | error
  def create_public_key(attrs, %User{} = user) do
    %PublicKey{user_id: user.id}
    |> PublicKey.changeset(attrs)
    |> Core.Repo.insert()
  end

  @doc """
  Deletes a public key, and fails if it's owned by a different user
  """
  @spec delete_public_key(binary, User.t) :: {:ok, PublicKey.t} | error
  def delete_public_key(id, %User{} = user) do
    get_public_key!(id)
    |> allow(user, :delete)
    |> when_ok(:delete)
  end

  @doc """
  Creates a new user
  """
  @spec create_user(map) :: user_resp
  def create_user(attrs) do
    start_transaction()
    |> add_operation(:pre, fn _ ->
      confirm_by = Timex.now() |> Timex.shift(days: 7)
      %User{email_confirm_by: confirm_by}
      |> User.changeset(attrs)
      |> User.changeset(%{onboarding_checklist: %{status: :new}})
      |> Core.Repo.insert()
    end)
    |> add_operation(:user, fn %{pre: user} ->
      case Accounts.get_mapping_for_email(user.email) do
        %DomainMapping{account: %Account{id: aid}} ->
          user
          |> Ecto.Changeset.change(%{account_id: aid})
          |> Core.Repo.update()
        _ ->
          Accounts.create_account(Map.get(attrs, :account, %{}), user)
          |> when_ok(& &1.user)
      end
    end)
    |> execute(extract: :user)
    |> notify(:create)
  end

  @doc """
  Bootstraps a user in response to an oauth/sso callback.  Will update the user if already exists, otherwise creates
  the user given the oauth response
  """
  @spec bootstrap_user(Core.OAuth.method, map) :: user_resp
  def bootstrap_user(service, %{email: email} = attrs) do
    User.mark_url_safe()
    case {service, get_user_by_email(email)} do
      {_, nil} ->
        attrs
        |> Map.merge(login_args(service))
        |> Map.put(:password, Ecto.UUID.generate())
        |> create_user()
      {service, %User{login_method: svc} = user} when service == :sso or service == svc ->
        update_user(login_args(service), user)
      _ -> {:error, "you don't have login with #{service} enabled"}
    end
  end

  defp login_args(:sso), do: %{}
  defp login_args(service), do: %{login_method: service}

  @doc "self explanatory"
  @spec update_user(map, User.t) :: user_resp
  def update_user(attrs, %User{} = user) do
    user
    |> User.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(&validate_pwd(&1, attrs, user))
    |> when_ok(:update)
    |> notify(:update, user)
  end

  @spec update_user(map, binary, User.t) :: user_resp
  def update_user(attrs, id, %User{} = user) do
    prev = get_user(id)
    start_transaction()
    |> add_operation(:user, fn _ ->
      prev
      |> User.changeset(attrs, :secondary)
      |> allow(user, :edit)
      |> when_ok(:update)
    end)
    |> add_groups(attrs)
    |> execute(extract: :user)
    |> notify(:update, user)
  end

  defp add_groups(xact, %{group_ids: [_ | _] = group_ids}) do
    Enum.reduce(group_ids, remove_groups(xact), fn group_id, xact ->
      add_operation(xact, {:group, group_id}, fn %{user: user} ->
        Accounts.upsert_group_member(group_id, user.id)
      end)
    end)
  end
  defp add_groups(xact, _), do: xact

  defp remove_groups(xact) do
    add_operation(xact, :rm_groups, fn %{user: user} ->
      Core.Schema.GroupMember.for_user(user.id)
      |> Core.Repo.delete_all()
      |> elem(0)
      |> ok()
    end)
  end

  defp validate_pwd(%Ecto.Changeset{} = changes, attrs, prev) do
    with {:ok, _} <- Ecto.Changeset.apply_changes(changes)
                     |> validate_pwd(attrs, prev),
      do: {:ok, changes}
  end
  defp validate_pwd(%User{password_change: true} = user, %{confirm: confirm}, prev) when is_binary(confirm) do
    case Argon2.check_pass(prev, confirm) do
      {:ok, _} -> {:ok, user}
      _ -> {:error, "invalid confirmation password"}
    end
  end
  defp validate_pwd(%User{password_change: true}, _, _), do: {:error, "must confirm password to change"}
  defp validate_pwd(user, _, _), do: {:ok, user}

  @doc "self explanatory"
  @spec update_provider(atom, User.t) :: user_resp
  def update_provider(provider, %User{} = user) do
    user
    |> Ecto.Changeset.change(%{provider: provider})
    |> Core.Repo.update()
    |> notify(:update, user)
  end

  @doc "self explanatory"
  @spec delete_user(binary, User.t) :: user_resp
  def delete_user(id, %User{} = user) do
    get_user(id)
    |> allow(user, :delete)
    |> when_ok(:delete)
    |> notify(:delete, user)
  end

  @doc """
  Creates a new publisher for the acting user.
  """
  @spec create_publisher(map, User.t) :: {:ok, Publisher.t} | error
  def create_publisher(attrs, %User{} = user) do
    %Publisher{owner_id: user.id, account_id: user.account_id}
    |> Publisher.changeset(attrs)
    |> Core.Repo.insert()
  end

  @doc """
  Updates the acting user's publisher
  """
  @spec update_publisher(map, User.t) :: {:ok, Publisher.t} | error
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
  @spec upsert_webhook(binary, User.t) :: {:ok, Webhook.t} | error
  def upsert_webhook(url, %User{id: user_id}) do
    case Core.Repo.get_by(Webhook, url: url, user_id: user_id) do
      %Webhook{} = webhook -> {:ok, webhook}
      nil -> %Webhook{user_id: user_id} |> Webhook.changeset(%{url: url}) |> Core.Repo.insert()
    end
  end

  @doc """
  Creates a reset token for a user which can be used for things like password resets
  """
  @spec create_reset_token(map) :: {:ok, ResetToken.t} | error
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
  @spec realize_reset_token(ResetToken.t, map) :: user_resp
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
    start_transaction()
    |> add_operation(:token, fn _ -> {:ok, get_reset_token!(id)} end)
    |> add_operation(:realize, fn %{token: token} ->
      Core.Repo.preload(token, [:user])
      |> realize_reset_token(args)
    end)
    |> add_operation(:del, fn %{token: token} -> Core.Repo.delete(token) end)
    |> execute(extract: :realize)
  end

  @doc """
  Makes a signed http POST to the given webhook url, with the payload:

  ```
  {"repo": `repo`}
  ```
  """
  @spec post_webhook(map, Webhook.t) :: {:ok, %Mojito.Response{}} | error
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

  @doc """
  Initiates a device login by creating a login token and formatting a login url for the device client
  """
  @spec device_login() :: {:ok, %DeviceLogin{}} | error
  def device_login() do
    %LoginToken{}
    |> LoginToken.changeset()
    |> Core.Repo.insert()
    |> when_ok(fn %{token: token} ->
      ok(%DeviceLogin{
        device_token: token,
        login_url: Core.url("/login?deviceToken=#{token}")
      })
    end)
  end

  @doc """
  Takes a given login token, marks it as active, and sets its user to the current user
  """
  @spec activate_login_token(binary, User.t) :: {:ok, %LoginToken{}} | error
  def activate_login_token(token, %User{id: user_id}) do
    with %LoginToken{} = token <- get_login_token(token) do
      LoginToken.changeset(token, %{user_id: user_id, active: true})
      |> Core.Repo.update()
    else
      _ -> {:error, :not_found}
    end
  end

  @doc """
  Returns whether the user has installations or not.  This operation is cached and can lag
  """
  @spec has_installations?(User.t) :: boolean
  @decorate cacheable(cache: Core.Cache, key: {:has_installations, user_id}, opts: [ttl: @ttl])
  def has_installations?(%User{id: user_id}) do
    Core.Schema.Installation.for_user(user_id)
    |> Core.Repo.exists?()
  end

  @doc """
  Determines whether a user has an active demo project
  """
  @spec demoing?(User.t) :: boolean
  def demoing?(%User{id: user_id}) do
    Core.Schema.DemoProject.for_user(user_id)
    |> Core.Repo.exists?()
  end

  @doc """
  Determines whether a user has reached the demo project usage limit
  """
  @spec demoed?(User.t) :: boolean
  def demoed?(%User{demo_count: count}), do: count >= Demo.max_demo_count()

  @doc """
  Fetches or creates an eab key for the user mapped to that (cluster, provider)
  """
  @spec get_eab_key(binary, binary, User.t) :: {:ok, EabCredential.t} | error
  @decorate cacheable(cache: Core.Cache, key: {:eab, cluster, provider, user_id}, opts: [ttl: @ttl], match: &cacheit/1)
  def get_eab_key(cluster, provider, %User{id: user_id} = user) do
    Core.Repo.get_by(EabCredential,
      cluster: cluster,
      provider: provider,
      user_id: user_id
    )
    |> case do
      %EabCredential{} = cred -> {:ok, cred}
      _ -> materialize_eab_key(cluster, provider, user)
    end
  end

  @doc """
  Will create an event for a user
  """
  @spec create_event(map, User.t) :: {:ok, UserEvent.t} | error
  def create_event(attrs, %User{id: user_id}) do
    %UserEvent{user_id: user_id}
    |> UserEvent.changeset(attrs)
    |> Core.Repo.insert()
  end

  @doc """
  destroys all resources associated w/ a cluster.  Some of this is best effort and must be cleaned up in cron after if failed
  """
  @spec destroy_cluster(%{domain: binary, name: binary, provider: atom}, User.t) :: :ok | error
  def destroy_cluster(%{domain: d, name: name, provider: p}, %User{id: user_id} = user) do
    with {:ok, _} <- Core.Services.Upgrades.delete_queue(name, user),
         _ <- Core.Services.Clusters.delete_cluster(name, p, user) do
      Dns.get_domain(d)
      |> Dns.records()
      |> Enum.filter(fn
        %Core.Schema.DnsRecord{cluster: ^name, provider: ^p, creator_id: ^user_id} -> true
        _ -> false
      end)
      |> Enum.each(fn r ->
        %Conduit.Message{body: r}
        |> Core.broker().publish(:cluster)
      end)
    end
  end

  @doc """
  Get the user's EAB credential for this cluster/provider pair
  """
  def fetch_eab_key(cluster, provider, %User{id: user_id}) do
    Core.Repo.get_by(EabCredential,
      cluster: cluster,
      provider: provider,
      user_id: user_id
    )
  end

  def cacheit({:ok, _}), do: true
  def cacheit(_), do: false

  def get_provider(%User{} = user) do
    Core.Schema.TerraformInstallation.all_for_user(user.id)
    |> Core.Schema.TerraformInstallation.preload([:version])
    |> Core.Repo.all()
    |> Enum.find_value(fn
      %{version: %{dependencies: %{providers: [prov]}}} -> prov
      _ -> nil
    end)
  end

  def backfill_providers() do
    Core.Repo.all(Core.Schema.User)
    |> Enum.each(fn user ->
      {:ok, _} =
        Ecto.Changeset.change(user, %{provider: get_provider(user)})
        |> Core.Repo.update()
    end)
  end

  @doc """
  Removes an eab key to permit regeneration, for instance where a cluster is recreated
  """
  @spec delete_eab_key(binary, User.t) :: {:ok, EabCredential.t} | {:error, term}
  def delete_eab_key(id, %User{} = user) do
    Core.Repo.get(EabCredential, id)
    |> allow(user, :delete)
    |> when_ok(&delete_eab_key/1)
  end

  @decorate cache_evict(cache: Core.Cache, keys: [{:eab, eab.user_id, eab.cluster, eab.provider}])
  def delete_eab_key(%EabCredential{} = eab),
    do: Core.Repo.delete(eab)

  defp materialize_eab_key(cluster, provider, %User{id: user_id}) do
    with {:ok, %{success: valid} = resp} when valid in [1, true] <- ZeroSSL.generate_eab_credentials() do
      %EabCredential{user_id: user_id, cluster: cluster, provider: provider}
      |> EabCredential.changeset(%{
        key_id: resp.eab_kid,
        hmac_key: resp.eab_hmac_key
      })
      |> Core.Repo.insert()
    else
      {:ok, %{success: _}} -> {:error, "zerossl failure"}
      err -> err
    end
  end

  defp sanitize("https://" <> _ = url), do: url
  defp sanitize("http://" <> rest), do: "https://#{rest}"
  defp sanitize(url), do: "https://" <> url

  def hmac(secret, payload) when is_binary(payload) do
    :crypto.mac(:hmac, :sha, secret, payload)
    |> Base.encode16(case: :lower)
  end

  def notify({:ok, %User{} = u}, :delete, actor),
    do: handle_notify(PubSub.UserDeleted, u, actor: actor)
  def notify({:ok, %User{} = u}, :update, actor),
    do: handle_notify(PubSub.UserUpdated, u, actor: actor)
  def notify({:ok, %PersistedToken{} = p}, :create, actor),
    do: handle_notify(PubSub.PersistedTokenCreated, p, actor: actor)
  def notify(pass, _, _), do: pass

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
