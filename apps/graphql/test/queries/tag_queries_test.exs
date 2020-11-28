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

    test "It can list tag counts for repositories" do
      insert(:repository, tags: [%{tag: "tag", resource_type: :repository}])
      insert(:repository, tags: [%{tag: "other", resource_type: :repository}])
      insert(:repository, tags: [%{tag: "other", resource_type: :repository}])

      {:ok, %{data: %{"tags" => found}}} = run_query("""
        query {
          tags(type: REPOSITORIES, first: 5) {
            edges {
              node {
                tag
                count
              }
            }
          }
        }
      """, %{}, %{})

      [%{"tag" => "other", "count" => count}, %{"tag" => "tag", "count" => other_count}] = from_connection(found)

      assert count == 2
      assert other_count == 1
    end


    test "It can search and list tag counts for repositories" do
      insert(:repository, tags: [%{tag: "tag", resource_type: :repository}])
      insert(:repository, tags: [%{tag: "other", resource_type: :repository}])
      insert(:repository, tags: [%{tag: "other", resource_type: :repository}])

      {:ok, %{data: %{"tags" => found}}} = run_query("""
        query Tags($q: String) {
          tags(type: REPOSITORIES, first: 5, q: $q) {
            edges {
              node {
                tag
                count
              }
            }
          }
        }
      """, %{"q" => "ta"}, %{})

      [%{"tag" => "tag", "count" => 1}] = from_connection(found)
    end
  end
end