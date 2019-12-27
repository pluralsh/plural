defmodule GraphQl.TagQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "tags" do
    test "It can list tag counts for integrations" do
      repo = insert(:repository)
      insert(:integration, repository: repo, tags: [%{tag: "tag", resource_type: :integration}])
      insert(:integration, repository: repo, tags: [%{tag: "other", resource_type: :integration}])
      insert(:integration, repository: repo, tags: [%{tag: "other", resource_type: :integration}])

      {:ok, %{data: %{"tags" => found}}} = run_query("""
        query Tags($id: String!) {
          tags(id: $id, type: INTEGRATIONS, first: 5) {
            edges {
              node {
                tag
                count
              }
            }
          }
        }
      """, %{"id" => repo.id}, %{})

      [%{"tag" => "other", "count" => count}, %{"tag" => "tag", "count" => other_count}] = from_connection(found)

      assert count == 2
      assert other_count == 1
    end
  end
end