defmodule Core.Services.OAuth do
  use Core.Services.Base
  alias Core.Schema.{User, OIDCProvider}
  alias Core.Clients.Hydra
  alias Core.Services.Repositories

  @type error :: {:error, term}
  @type oauth_resp :: {:ok, %Hydra.Response{}} | error

  @doc """
  Gets the data related to a specific login
  """
  @spec get_login(binary) :: {:ok, OIDCProvider.t} | error
  def get_login(challenge) do
    with {:ok, %{client: client}} <- Hydra.get_login(challenge) do
      {:ok, Repositories.get_oidc_provider_by_client!(client.client_id)}
    end
  end

  @doc """
  Get the data related to a consent screen
  """
  @spec get_consent(binary) :: {:ok, OIDCProvider.t} | error
  def get_consent(challenge) do
    with {:ok, %{client: client}} <- Hydra.get_consent(challenge) do
      {:ok, Repositories.get_oidc_provider_by_client!(client.client_id)}
    end
  end

  @doc """
  Determines if a user is eligible to login, and either accepts or rejects the login
  request appropriately.
  """
  @spec handle_login(binary, User.t) :: oauth_resp
  def handle_login(challenge, %User{} = user) do
    user = Core.Services.Rbac.preload(user)
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
  def consent(challenge, scopes \\ ["profile"], %User{} = user),
    do: Hydra.accept_consent(user, challenge, scopes)

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
end
