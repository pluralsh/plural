defmodule GraphQl.Resolvers.OAuth do
  use GraphQl.Resolvers.Base, model: Core.Schema.OIDCProvider
  alias Core.Services.OAuth
  alias Core.OAuth, as: OAuthHandler

  def resolve_login(%{challenge: challenge}, _) do
    with {:ok, %{installation: inst}} <- OAuth.get_login(challenge),
      do: {:ok, inst.repository}
  end

  def list_urls(args, _) do
    {:ok, OAuthHandler.urls(args[:host])}
  end

  def resolve_callback(%{code: code, provider: provider} = args, _) do
    OAuthHandler.callback(provider, args[:host], code)
    |> GraphQl.Resolvers.User.with_jwt()
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
