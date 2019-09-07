defmodule ApiWeb.UserController do
  use ApiWeb, :controller
  alias Core.Services.Users

  def create(conn, params) do
    with {:ok, user} <- Users.create_user(params) do
      conn
      |> add_auth_headers(user)
      |> json(user)
    end
  end

  def login(conn, %{"email" => email, "password" => password}) do
    with {:ok, user} <- Users.login_user(email, password) do
      conn
      |> add_auth_headers(user)
      |> json(user)
    end
  end

  def create_publisher(conn, params) do
    current_user = Guardian.Plug.current_resource(conn)

    with {:ok, publisher} <- Users.create_publisher(params, current_user),
      do: json(conn, publisher)
  end
end