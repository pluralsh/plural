defmodule GraphQl.Resolvers.OAuth do
  use GraphQl.Resolvers.Base, model: Core.Schema.OIDCProvider
  alias Core.Schema.OIDCLogin
  alias Core.Services.{OAuth, Users}
  alias Core.OAuth, as: OAuthHandler
  alias GraphQl.Resolvers.User

  def list_logins(args, %{context: %{current_user: %{account_id: aid}}}) do
    OIDCLogin.for_account(aid)
    |> OIDCLogin.ordered()
    |> paginate(args)
  end

  def resolve_login(%{challenge: challenge}, _) do
    with {:ok, %{installation: inst}} <- OAuth.get_login(challenge),
      do: {:ok, inst.repository}
  end

  def list_urls(args, _) do
    {:ok, OAuthHandler.urls(args[:host])}
  end

  def resolve_callback(%{code: code, provider: provider} = args, _) do
    OAuthHandler.callback(provider, args[:host], code)
    |> User.with_jwt()
    |> User.activate_token(args)
  end

  def sso_callback(%{code: code} = args, _) do
    Users.sso_callback(code)
    |> User.with_jwt()
    |> User.activate_token(args)
  end

  def resolve_configuration(_, _), do: Core.Clients.Hydra.get_configuration()

  def resolve_consent(%{challenge: challenge}, _) do
    with {:ok, %{installation: inst}} <- OAuth.get_consent(challenge),
      do: {:ok, inst.repository}
  end

  def accept_login(%{challenge: challenge}, %{context: %{current_user: user}}),
    do: OAuth.handle_login(challenge, user)

  def accept_consent(%{challenge: challenge, scopes: scopes}, %{context: %{current_user: user}}),
    do: OAuth.consent(challenge, scopes, user)
end
