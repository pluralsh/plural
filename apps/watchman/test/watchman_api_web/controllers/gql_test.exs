defmodule WatchmanWeb.GqlTest do
  use WatchmanWeb.ConnCase, async: true

  @document """
    query {
      builds(first: 5) {
        edges {
          node {
            id
          }
        }
      }
    }
  """

  describe "POST /gql" do
    test "It can process graphql documents", %{conn: conn} do
      user = insert(:user)
      builds = insert_list(3, :build)

      %{"data" => %{"builds" => found}} =
        conn
        |> add_auth_headers(user)
        |> post("/gql", %{query: @document, variables: %{}})
        |> json_response(200)

      assert from_connection(found)
             |> ids_equal(builds)
    end
  end
end