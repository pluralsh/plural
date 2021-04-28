defmodule ApiWeb.AuthControllerTest do
  use ApiWeb.ConnCase, async: true
  alias Core.Auth.Jwt
  alias Core.Services.Repositories

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

  describe "#post_token/2" do
    test "It can fetch a valid repo auth token", %{conn: conn} do
      repo = insert(:repository)
      %{user: user} = insert(:installation, repository: repo)
      token = insert(:persisted_token, user: user)
      path = Routes.auth_path(conn, :token)

      %{"token" => bearer_token} =
        conn
        |> post(path, %{"scope" => "repository:#{repo.name}/image:push,pull", "password" => token.token})
        |> json_response(200)

      signer = Jwt.signer()
      {:ok, %{"access" => [perms]}} = Jwt.verify(bearer_token, signer)

      assert perms["name"] == "#{repo.name}/image"
      assert perms["type"] == "repository"
      assert Enum.sort(perms["actions"]) == ["pull"]
    end
  end

  describe "#refresh_license/2" do
    test "It can refresh the license for an installation", %{conn: conn} do
      publisher = insert(:publisher)
      {:ok, repo} = Repositories.create_repository(%{name: "my repo"}, publisher.owner)

      installation = insert(:installation, repository: repo)
      token = insert(:license_token, installation: installation)
      path = Routes.auth_path(conn, :refresh_license)

      %{"license" => _} =
        conn
        |> post(path, %{"refresh_token" => token.token})
        |> json_response(200)
    end
  end
end
