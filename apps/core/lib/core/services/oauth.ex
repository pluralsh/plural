defmodule Core.Services.OAuth do
  use Core.Services.Base
  import Core.Policies.OAuth
  alias Core.PubSub
  alias Core.Schema.{User, OIDCProvider, OIDCLogin}
  alias Core.Clients.Hydra
  alias Core.Services.{Repositories, Audits}
  require Logger

  @type error :: {:error, term}
  @type oauth_resp :: {:ok, %Hydra.Response{}} | error
  @type oidc_resp :: {:ok, OidcProvider.t} | error

  @oidc_scopes "profile code openid offline_access offline"
  @grant_types ~w(authorization_code refresh_token client_credentials)

  def get_provider(id), do: Repo.get(OIDCProvider, id)

  def get_provider!(id), do: Repo.get!(OIDCProvider, id)

  @doc """
  Creates a new oidc provider for a given installation, enabling a log-in with plural experience
  """
  @spec create_oidc_provider(map, User.t) :: oidc_resp
  def create_oidc_provider(attrs, %User{id: id} = user) do
    start_transaction()
    |> add_operation(:client, fn _ ->
      Map.take(attrs, [:redirect_uris])
      |> Map.put(:scope, @oidc_scopes)
      |> Map.put(:grant_types, @grant_types)
      |> Map.put(:token_endpoint_auth_method, oidc_auth_method(attrs.auth_method))
      |> Hydra.create_client()
    end)
    |> add_operation(:oidc_provider, fn
      %{client: %{client_id: cid, client_secret: secret}} ->
        attrs = Map.merge(attrs, %{client_id: cid, client_secret: secret})
                |> add_bindings(find_bindings(user))
        %OIDCProvider{owner_id: id}
        |> OIDCProvider.changeset(attrs)
        |> allow(user, :create)
        |> when_ok(:insert)
    end)
    |> execute(extract: :oidc_provider)
    |> notify(:create)
  end

  defp add_bindings(attrs, bindings) do
    bindings = Enum.uniq_by((attrs[:bindings] || []) ++ bindings, & {&1[:group_id], &1[:user_id]})
    Map.put(attrs, :bindings, bindings)
  end

  defp oidc_auth_method(:basic), do: "client_secret_basic"
  defp oidc_auth_method(:post), do: "client_secret_post"

  @doc """
  Updates the spec of an installation's oidc provider
  """
  @spec update_oidc_provider(map, binary, User.t) :: oidc_resp
  def update_oidc_provider(attrs, id, %User{} = user) do
    start_transaction()
    |> add_operation(:oidc, fn _ ->
      get_provider!(id)
      |> Repo.preload([:bindings])
      |> OIDCProvider.changeset(attrs)
      |> allow(user, :edit)
      |> when_ok(:update)
    end)
    |> add_operation(:client, fn
      %{oidc: %{client_id: id, auth_method: auth_method}} ->
        attrs = Map.take(attrs, [:redirect_uris])
                |> Map.put(:scope, @oidc_scopes)
                |> Map.put(:token_endpoint_auth_method, oidc_auth_method(auth_method))
        Hydra.update_client(id, attrs)
    end)
    |> execute(extract: :oidc)
    |> notify(:update)
  end

  @doc """
  Deletes an oidc provider and its hydra counterpart
  """
  @spec delete_oidc_provider(binary, User.t) :: oidc_resp
  def delete_oidc_provider(id, %User{} = user) do
    start_transaction()
    |> add_operation(:oidc, fn _ ->
      get_provider!(id)
      |> allow(user, :edit)
      |> when_ok(:delete)
    end)
    |> add_operation(:client, fn %{oidc: %{client_id: id}} ->
      with :ok <- Hydra.delete_client(id),
        do: {:ok, nil}
    end)
    |> execute(extract: :oidc)
  end

  @doc """
  Gets the data related to a specific login
  """
  @spec get_login(binary) :: {:ok, OIDCProvider.t} | error
  def get_login(challenge) do
    with {:ok, %{client: client} = login} <- Hydra.get_login(challenge),
         provider <- Repositories.get_oidc_provider_by_client!(client.client_id) do
      {:ok, %{provider | login: login}}
    end
  end

  @doc """
  Get the data related to a consent screen
  """
  @spec get_consent(binary) :: {:ok, OIDCProvider.t} | error
  def get_consent(challenge) do
    with {:ok, %{client: client} = consent} <- Hydra.get_consent(challenge),
         provider <- Repositories.get_oidc_provider_by_client!(client.client_id) do
      {:ok, %{provider | consent: consent}}
    end
  end

  @doc """
  Determines if a user is eligible to login, and either accepts or rejects the login
  request appropriately.
  """
  @spec handle_login(binary, User.t) :: oauth_resp
  def handle_login(challenge, %User{} = user) do
    user = Core.Services.Rbac.preload(user)
           |> Core.Repo.preload([:groups])
    with {:ok, provider} <- get_login(challenge),
         true <- eligible?(provider, user) do
      Hydra.accept_login(challenge, user)
    else
      false -> Hydra.reject_login(challenge)
      error -> error
    end
  end

  @doc """
  Consents to the scopes granted in the login exchanges and hydrates an id token
  """
  @spec consent(binary, [binary], User.t) :: oauth_resp
  def consent(challenge, scopes \\ ["profile", "offline_access", "offline"], %User{} = user) do
    user = Core.Repo.preload(user, [:groups])
    with {:ok, provider} <- get_consent(challenge),
         {:ok, _} = res <- Hydra.accept_consent(user, challenge, scopes),
         _ <- persist_login(user, provider),
      do: res
  end

  @doc """
  Determines if a user can use this provider to log in, based on its configured policy
  """
  @spec eligible?(OIDCProvider.t, User.t) :: boolean
  def eligible?(%OIDCProvider{bindings: bindings}, %User{} = user) do
    group_ids = Enum.filter(bindings, & &1.group_id)
                |> Enum.map(& &1.group_id)
                |> MapSet.new()
    user_groups = Enum.map(user.groups, & &1.id) |> MapSet.new()

    with false <- Enum.any?(bindings, & &1.user_id == user.id),
      do: !MapSet.disjoint?(user_groups, group_ids)
  end

  defp persist_login(%User{id: user_id, account_id: aid}, %OIDCProvider{id: prov_id}) do
    ctx = Audits.context_attributes()
    try do
      %OIDCLogin{user_id: user_id, provider_id: prov_id, account_id: aid}
      |> OIDCLogin.changeset(ctx)
      |> Core.Repo.insert()
    rescue
      _ ->
        Logger.error "Failed to insert oidc login with attributes: #{inspect(ctx)}"
        {:error, :failure}
    end
  end

  defp notify({:ok, %OIDCProvider{} = oidc}, :create),
    do: handle_notify(PubSub.OIDCProviderCreated, oidc)
  defp notify({:ok, %OIDCProvider{} = oidc}, :update),
    do: handle_notify(PubSub.OIDCProviderUpdated, oidc)

  defp notify(pass, _), do: pass
end
