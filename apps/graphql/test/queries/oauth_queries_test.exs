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

  describe "oidcLogin" do
    test "it can fetch an oauth login's details" do
      provider = insert(:oidc_provider)
      expect(HTTPoison, :get, fn _, _ ->
        body = Jason.encode!(%{client: %{client_id: provider.client_id}, requested_scope: ["openid"]})
        {:ok, %{status_code: 200, body: body}}
      end)

      {:ok, %{data: %{"oidcLogin" => result}}} = run_query("""
        query Login($challenge: String!) {
          oidcLogin(challenge: $challenge) {
            repository { id }
            login { requestedScope }
          }
        }
      """, %{"challenge" => "challenge"})

      assert result["repository"]["id"] == provider.installation.repository_id
      assert result["login"]["requestedScope"] == ["openid"]
    end
  end

  describe "oidcConsent" do
    test "it can fetch an oauth login's details" do
      provider = insert(:oidc_provider)
      expect(HTTPoison, :get, fn _, _ ->
        body = Jason.encode!(%{client: %{client_id: provider.client_id}, requested_scope: ["openid"]})
        {:ok, %{status_code: 200, body: body}}
      end)

      {:ok, %{data: %{"oidcConsent" => result}}} = run_query("""
        query Login($challenge: String!) {
          oidcConsent(challenge: $challenge) {
            repository { id }
            consent { requestedScope }
          }
        }
      """, %{"challenge" => "challenge"})

      assert result["repository"]["id"] == provider.installation.repository_id
      assert result["consent"]["requestedScope"] == ["openid"]
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
                owner { id }
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(logins)

      assert from_connection(found)
             |> Enum.all?(& &1["repository"]["id"])
      assert from_connection(found)
             |> Enum.all?(& &1["owner"]["id"])
    end
  end

  describe "loginMetrics" do
    test "it will aggregate country level login stats" do
      user = insert(:user)
      insert_list(3, :oidc_login, account: user.account, country: "US")
      insert_list(2, :oidc_login, account: user.account, country: "CN")
      insert(:oidc_login, country: "UK")

      {:ok, %{data: %{"loginMetrics" => metrics}}} = run_query("""
        query {
          loginMetrics { country count }
        }
      """, %{}, %{current_user: user})

      grouped = Enum.into(metrics, %{}, & {&1["country"], &1["count"]})

      assert grouped["US"] == 3
      assert grouped["CN"] == 2
      refute grouped["UK"]
    end
  end
end
