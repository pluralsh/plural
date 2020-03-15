defmodule Watchman.GraphQl.WebhookQueriesTest do
  use Watchman.DataCase, async: true

  describe "webhooks" do
    test "It can list webhooks" do
      webhooks = insert_list(3, :webhook)

      {:ok, %{data: %{"webhooks" => found}}} = run_query("""
        query {
          webhooks(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(webhooks)
    end
  end
end