defmodule Core.Services.OAuth do
  use Core.Services.Base
  alias Core.Schema.{User, OIDCProvider, OIDCLogin}
  alias Core.Clients.Hydra
  alias Core.Services.{Repositories, Audits}
  require Logger

  @type error :: {:error, term}
  @type oauth_resp :: {:ok, %Hydra.Response{}} | error

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
end
