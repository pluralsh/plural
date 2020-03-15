defmodule Watchman.GraphQl.WebhookMutationsTest do
  use Watchman.DataCase, async: true

  describe "createWebhook" do
    test "It can create a new webhook" do
      {:ok, %{data: %{"createWebhook" => webhook}}} = run_query("""
        mutation CreateWH($url: String!) {
          createWebhook(attributes: {url: $url}) {
            id
            url
          }
        }
      """, %{"url" => "https://example.com"}, %{current_user: insert(:user)})

      assert webhook["id"]
      assert webhook["url"] == "https://example.com"
    end
  end
end