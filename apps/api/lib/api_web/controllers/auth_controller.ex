defmodule ApiWeb.AuthController do
  use ApiWeb, :controller
  alias Core.Services.Repositories
  alias Core.Services.Users
  plug BasicAuth, callback: &__MODULE__.fetch_user/3

  def token(conn, %{"scope" => "repository:" <> repo}) do
    user = conn.assigns.token.user
    [full_name, _] = String.split(repo, ":")
    [repo_name | _] = String.split(full_name, "/")
    allowed_scopes = Repositories.authorize_docker(repo_name, user)

    with {:ok, token} <- Repositories.docker_token(allowed_scopes, full_name, user) do
      json(conn, %{token: token, access_token: token})
    end
  end
  def token(conn, %{"account" => _, "service" => _}) do
    with {:ok, token} <- Repositories.dkr_login_token(conn.assigns.token.user) do
      json(conn, %{token: token, access_token: token})
    end
  end

  def fetch_user(conn, _name, token) do
    case Users.get_persisted_token(token) do
      nil -> ApiWeb.FallbackController.call(conn, {:error, :unauthorized}) |> halt()
      token -> assign(conn, :token, token)
    end
  end
end