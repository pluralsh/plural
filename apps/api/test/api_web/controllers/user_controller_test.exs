defmodule ApiWeb.UserControllerTest do
  use ApiWeb.ConnCase, async: true
  alias Core.Services.Users

  describe "#signup" do
    test "It will create a new user", %{conn: conn} do
      path = Routes.user_path(conn, :create)

      result =
        conn
        |> post(path, %{email: "someone@example.com", name: "Some User", password: "verystrongpwd"})
        |> assert_header("authorization", &valid_bearer_token/1)
        |> json_response(200)

      assert result["email"] == "someone@example.com"
      refute result["password"]
    end
  end

  describe "#login" do
    test "A user can log in", %{conn: conn} do
      path = Routes.user_path(conn, :login)
      {:ok, _} = Core.Services.Users.create_user(%{
        email: "someone@example.com",
        name: "Some User",
        password: "verystrongpwd"
      })

      result =
        conn
        |> post(path, %{email: "someone@example.com", password: "verystrongpwd"})
        |> assert_header("authorization", &valid_bearer_token/1)
        |> json_response(200)

      assert result["email"] == "someone@example.com"
      refute result["password"]
    end
  end

  describe "#create_publisher" do
    test "Users can create publishers", %{conn: conn} do
      user = insert(:user)
      path = Routes.user_path(conn, :create_publisher)

      result =
        conn
        |> authorized(user)
        |> post(path, %{"name" => "Publisher"})
        |> json_response(200)

      assert result["name"] == "Publisher"
      assert result["owner_id"] == user.id
    end
  end

  describe "#me" do
    test "It can authorize with persisted tokens", %{conn: conn} do
      user = insert(:user)
      {:ok, token} = Users.create_persisted_token(user)
      path = Routes.user_path(conn, :me)

      conn
      |> Plug.Conn.put_req_header("authorization", "Bearer #{token.token}")
      |> get(path)
      |> json_response(200)
    end
  end

  defp valid_bearer_token("Bearer " <> token) do
    case Core.Guardian.decode_and_verify(token) do
      {:ok, _} -> true
      _ -> false
    end
  end
end