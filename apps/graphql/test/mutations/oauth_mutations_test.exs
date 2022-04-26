defmodule GraphQl.OAuthMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  use Mimic

  describe "acceptLogin" do
    test "it can confirm an oauth login" do
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

      {:ok, %{data: %{"acceptLogin" => result}}} = run_query("""
        mutation Accept($challenge: String!) {
          acceptLogin(challenge: $challenge) { redirectTo }
        }
      """, %{"challenge" => "chall"}, %{current_user: user})

      assert result["redirectTo"] == "example.com"
    end
  end

  describe "oauthConsent" do
    test "it can consent to an oauth login" do
      user = insert(:user)
      provider = insert(:oidc_provider)

      expect(HTTPoison, :put, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{redirect_to: "example.com"})}}
      end)
      expect(HTTPoison, :get, fn _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client: %{client_id: provider.client_id}})}}
      end)

      {:ok, %{data: %{"oauthConsent" => result}}} = run_query("""
        mutation Consent($challenge: String!, $scopes: [String]) {
          oauthConsent(challenge: $challenge, scopes: $scopes) { redirectTo }
        }
      """, %{"challenge" => "chall", "scopes" => ["profile"]}, %{current_user: user})

      assert result["redirectTo"] == "example.com"
    end
  end

  describe "ssoCallback" do
    test "it will query workos and bootstrap a new user" do
      expect(WorkOS.SSO, :get_profile, fn "code" ->
        {:ok, %{"profile" => %{"email" => "someone@example.com", "first_name" => "SSO", "last_name" => "User"}}}
      end)

      {:ok, %{data: %{"ssoCallback" => user}}} = run_query("""
        mutation Callback($code: String!) {
          ssoCallback(code: $code) {
            id
            email
            loginMethod
          }
        }
      """, %{"code" => "code"})

      assert user["email"] == "someone@example.com"
      assert user["loginMethod"] == "SSO"
    end
  end
end
