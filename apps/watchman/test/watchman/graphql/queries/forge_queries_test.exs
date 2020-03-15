defmodule Watchman.GraphQl.ForgeQueriesTest do
  use Watchman.DataCase, async: true
  use Mimic
  alias Watchman.Forge.Queries

  describe "installations" do
    test "It will fetch your installations from forge" do
      body = Jason.encode!(%{
        query: Queries.installation_query(),
        variables: %{first: 5}
      })
      installations = [%{id: "id", repository: %{id: "id2", name: "repo", description: "desc"}}]

      expect(Mojito, :post, fn _, _, ^body ->
        {:ok, %{body: Jason.encode!(%{data: %{installations: as_connection(installations)}})}}
      end)

      {:ok, %{data: %{"installations" => %{"pageInfo" => page_info, "edges" => [edge]}}}} = run_query("""
        query {
          installations(first: 5) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                repository {
                  id
                  name
                  description
                }
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      assert page_info["hasNextPage"]
      assert page_info["endCursor"] == "something"

      assert edge["node"]["id"] == "id"
      assert edge["node"]["repository"]["id"] == "id2"
      assert edge["node"]["repository"]["name"] == "repo"
      assert edge["node"]["repository"]["description"] == "desc"
    end
  end

  defp as_connection(nodes) do
    %{
      pageInfo: %{hasNextPage: true, endCursor: "something"},
      edges: Enum.map(nodes, & %{node: &1})
    }
  end
end