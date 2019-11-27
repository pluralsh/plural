defmodule ApiWeb.AuthControllerTest do
  use ApiWeb.ConnCase, async: true
  alias Core.Auth.Jwt

  describe "#token/2" do
    test "It can fetch a valid repo auth token", %{conn: conn} do
      repo = insert(:repository)
      %{user: user} = insert(:installation, repository: repo)
      token = insert(:persisted_token, user: user)
      path = Routes.auth_path(conn, :token)

      %{"token" => bearer_token} =
        conn
        |> basic_auth(user.email, token.token)
        |> get(path, %{"scope" => "repository:#{repo.name}/image:push,pull"})
        |> json_response(200)

      signer = Jwt.signer()
      {:ok, %{"access" => [perms]}} = Jwt.verify(bearer_token, signer)

      assert perms["name"] == "#{repo.name}/image"
      assert perms["type"] == "repository"
      assert Enum.sort(perms["actions"]) == ["pull"]
    end
  end
end