defmodule ApiWeb.AuthController do
  use ApiWeb, :controller
  alias Core.Services.Repositories
  alias Core.Services.Users

  plug :fetch_user when action == :token

  def post_token(conn, %{"scope" => "repository:" <> repo, "password" => token}) do
    with %Core.Schema.PersistedToken{user: %{} = user} <- Users.get_persisted_token(token),
          {allowed, full_name} <- fetch_scopes(repo, user),
          {:ok, token} <- Repositories.docker_token(allowed, full_name, user) do
      json(conn, %{token: token, access_token: token})
    else
      nil -> {:error, :unauthorized}
      error -> error
    end
  end

  def token(conn, %{"scope" => "repository:" <> repo}) do
    user = conn.assigns.user
    {allowed_scopes, full_name} = fetch_scopes(repo, user)

    with {:ok, token} <- Repositories.docker_token(allowed_scopes, full_name, user) do
      json(conn, %{token: token, access_token: token})
    end
  end

  def token(conn, %{"account" => _, "service" => _}) do
    with {:ok, token} <- Repositories.dkr_login_token(conn.assigns.user) do
      json(conn, %{token: token, access_token: token})
    end
  end

  def refresh_license(conn, %{"refresh_token" => token}) do
    with {:ok, license} <- Repositories.refresh_license(token) do
      json(conn, %{license: license})
    end
  end

  def fetch_user(conn, _) do
    with {_, pass} <- Plug.BasicAuth.parse_basic_auth(conn),
         %{user: user} <- Users.get_persisted_token(pass) do
      assign(conn, :user, user)
    else
      _ -> assign(conn, :user, nil)
    end
  end

  defp fetch_scopes(repo, user) do
    [full_name, _] = String.split(repo, ":")
    [repo_name | rest] = String.split(full_name, "/")
    {Repositories.authorize_docker(repo_name, Enum.join(rest, "/"), user), full_name}
  end
end
