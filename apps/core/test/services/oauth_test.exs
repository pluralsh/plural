defmodule Core.Services.OAuthTest do
  use Core.SchemaCase, async: true
  alias Core.Services.OAuth
  alias Core.Schema.OIDCLogin
  use Mimic

  describe "#get_login/1" do
    test "It can get information related to an oauth login" do
      provider = insert(:oidc_provider)
      expect(HTTPoison, :get, fn _, _ ->
        body = Jason.encode!(%{client: %{client_id: provider.client_id}})
        {:ok, %{status_code: 200, body: body}}
      end)

      {:ok, result} = OAuth.get_login("challenge")

      assert result.id == provider.id
    end
  end

  describe "#handle_login/2" do
    test "If a user is bound by a provider, they can log in" do
      %{id: id} = user = insert(:user)
      provider = insert(:oidc_provider)
      insert(:oidc_provider_binding, provider: provider, user: user)

      expect(HTTPoison, :get, fn _, _ ->
        body = Jason.encode!(%{client: %{client_id: provider.client_id}})
        {:ok, %{status_code: 200, body: body}}
      end)

      expect(HTTPoison, :put, fn _, body, _ ->
        resp = Jason.encode!(%{redirect_to: "example.com"})
        case Jason.decode!(body) do
          %{"subject" => ^id} -> {:ok, %{status_code: 200, body: resp}}
          _ -> {:error, :invalid}
        end
      end)

      {:ok, %{redirect_to: url}} = OAuth.handle_login("challenge", user)

      assert url == "example.com"
    end

    test "if a user is not bound, the login is rejected" do
      %{id: id} = user = insert(:user)
      provider = insert(:oidc_provider)

      expect(HTTPoison, :get, fn _, _ ->
        body = Jason.encode!(%{client: %{client_id: provider.client_id}})
        {:ok, %{status_code: 200, body: body}}
      end)

      expect(HTTPoison, :put, fn _, body, _ ->
        resp = Jason.encode!(%{redirect_url: "example.com"})
        case Jason.decode!(body) do
          %{"subject" => ^id} -> {:error, :invalid}
          _ -> {:ok, %{status_code: 200, body: resp}}
        end
      end)

      {:ok, %{redirect_to: _}} = OAuth.handle_login("challenge", user)
    end
  end

  describe "#consent/3" do
    test "it will accept an oauth consent request" do
      me = self()
      user = insert(:user)
      provider = insert(:oidc_provider)
      expect(HTTPoison, :put, fn _, body, _ ->
        send(me, {:body, Jason.decode!(body)})
        {:ok, %{status_code: 200, body: Jason.encode!(%{redirect_to: "example.com"})}}
      end)

      expect(HTTPoison, :get, fn _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client: %{client_id: provider.client_id}})}}
      end)

      {:ok, %{redirect_to: _}} = OAuth.consent("challenge", "profile", user)

      assert_receive {:body, %{
        "session" => %{"id_token" => %{"groups" => _, "name" => _, "profile" => _}}
      }}

      [login] = Core.Repo.all(OIDCLogin)
      assert login.user_id == user.id
      assert login.provider_id == provider.id
      assert login.account_id == user.account_id
    end
  end
end
