defmodule Core.OAuth.Gitlab do
  use OAuth2.Strategy
  use Core.OAuth.Base

  def client(redirect \\ nil, suffix \\ "") do
    OAuth2.Client.new([
      strategy: __MODULE__,
      client_id: get_env("GITLAB_CLIENT_ID"),
      client_secret: get_env("GITLAB_CLIENT_SECRET"),
      redirect_uri: "#{redirect || host()}/oauth/callback/gitlab#{suffix}",
      site: "https://gitlab.com",
      authorize_url: "/oauth/authorize",
      token_url: "/oauth/token"
    ])
    |> OAuth2.Client.put_serializer("application/json", Jason)
  end

  def authorize_url!(redirect \\ nil) do
    OAuth2.Client.authorize_url!(client(redirect), scope: "profile email openid")
  end

  def get_token!(redirect \\ nil, code) do
    OAuth2.Client.get_token!(client(redirect), code: code)
  end

  def get_user(client) do
    case OAuth2.Client.get(client, url("/user")) do
      {:ok, %OAuth2.Response{body: user}} ->
        construct_user(client, user)
      {:error, %OAuth2.Response{status_code: 401, body: body}} ->
        Logger.error("Unauthorized token, #{inspect(body)}")
        {:error, :unauthorized}
      {:error, %OAuth2.Error{reason: reason}} ->
        Logger.error("Error: #{inspect(reason)}")
        {:error, reason}
    end
  end

  defp construct_user(_, %{"email" => email} = user) when is_binary(email),
    do: {:ok, build_user(user)}

  defp construct_user(client, user) do
    case OAuth2.Client.get(client, url("/user/emails")) do
      {:ok, %OAuth2.Response{body: [%{"email" => email} | _]}} ->
        build_user(user)
        |> Map.put(:email, email)
        |> ok()
      _ -> {:error, :no_email}
    end
  end

  defp url(path), do: Path.join(["/api/v4", path])
end
