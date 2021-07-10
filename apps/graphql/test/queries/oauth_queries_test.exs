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
end
