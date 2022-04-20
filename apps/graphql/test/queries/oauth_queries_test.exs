defmodule GraphQl.OAuthQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  use Mimic

  describe "oauthLogin" do
    test "it can fetch an oauth login's details" do
      provider = insert(:oidc_provider)
      expect(HTTPoison, :get, fn _, _ ->
        body = Jason.encode!(%{client: %{client_id: provider.client_id}})
        {:ok, %{status_code: 200, body: body}}
      end)

      {:ok, %{data: %{"oauthLogin" => result}}} = run_query("""
        query Login($challenge: String!) {
          oauthLogin(challenge: $challenge) { id }
        }
      """, %{"challenge" => "challenge"})

      assert result["id"] == provider.installation.repository_id
    end
  end

  describe "oauthConsent" do
    test "it can fetch an oauth login's details" do
      provider = insert(:oidc_provider)
      expect(HTTPoison, :get, fn _, _ ->
        body = Jason.encode!(%{client: %{client_id: provider.client_id}})
        {:ok, %{status_code: 200, body: body}}
      end)

      {:ok, %{data: %{"oauthConsent" => result}}} = run_query("""
        query Login($challenge: String!) {
          oauthConsent(challenge: $challenge) { id }
        }
      """, %{"challenge" => "challenge"})

      assert result["id"] == provider.installation.repository_id
    end
  end

  describe "oidcLogins" do
    test "it can list logins for an account" do
      user   = insert(:user)
      logins = insert_list(3, :oidc_login, account: user.account)
      insert(:oidc_login)

      {:ok, %{data: %{"oidcLogins" => found}}} = run_query("""
        query {
          oidcLogins(first: 5) {
            edges {
              node {
                id
                repository { id }
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(logins)

      assert from_connection(found)
             |> Enum.all?(& &1["repository"]["id"])
    end
  end
end
