defmodule Core.Services.OAuthTest do
  use Core.SchemaCase, async: true
  alias Core.Services.OAuth
  alias Core.Schema.OIDCLogin
  use Mimic

  describe "#create_oidc_provider/2" do
    test "a user can create an oidc provider" do
      account = insert(:account)
      group = insert(:group, account: account)
      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)
      user = insert(:user)

      {:ok, oidc} = OAuth.create_oidc_provider(%{
        redirect_uris: ["https://example.com"],
        auth_method: :basic,
        bindings: [%{user_id: user.id}, %{group_id: group.id}]
      }, user)

      assert oidc.client_id == "123"
      assert oidc.client_secret == "secret"
      assert oidc.redirect_uris == ["https://example.com"]
      assert oidc.owner_id == user.id

      [first, second] = oidc.bindings

      assert first.user_id == user.id
      assert second.group_id == group.id
    end
  end

  describe "#update_oidc_provider/2" do
    test "you can update your own providers" do
      user = insert(:user)
      oidc = insert(:oidc_provider, owner: user)
      expect(HTTPoison, :put, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      {:ok, updated} = OAuth.update_oidc_provider(%{
        redirect_uris: ["https://example.com"],
        auth_method: :basic
      }, oidc.id, user)

      assert updated.id == oidc.id
      assert updated.auth_method == :basic
    end

    test "others cannot update your provider" do
      user = insert(:user)
      oidc = insert(:oidc_provider, owner: user)

      {:error, :forbidden} = OAuth.update_oidc_provider(%{
        redirect_uris: ["https://example.com"],
        auth_method: :basic
      }, oidc.id, insert(:user))
    end
  end

  describe "#delete_oidc_provider/2" do
    test "you can delete your own providers" do
      user = insert(:user)
      oidc = insert(:oidc_provider, owner: user)
      expect(HTTPoison, :delete, fn _, _ -> {:ok, %{status_code: 204, body: ""}} end)

      {:ok, deleted} = OAuth.delete_oidc_provider(oidc.id, user)

      assert deleted.id == oidc.id
      refute refetch(deleted)
    end

    test "others cannot delete your provider" do
      user = insert(:user)
      oidc = insert(:oidc_provider, owner: user)

      {:error, :forbidden} = OAuth.delete_oidc_provider(oidc.id, insert(:user))
    end
  end

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
      user = insert(:user, roles: %{admin: true})
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
        "session" => %{"id_token" => %{"groups" => _, "name" => _, "profile" => _, "admin" => true}}
      }}

      [login] = Core.Repo.all(OIDCLogin)
      assert login.user_id == user.id
      assert login.provider_id == provider.id
      assert login.account_id == user.account_id
    end
  end
end
