defmodule GraphQl.TerraformQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "#terraform" do
    test "It can list tf packages for a repo" do
      repo = insert(:repository)
      terraform = for i <- 1..3, do: insert(:terraform, name: "tf #{i}", repository: repo)

      {:ok, %{data: %{"terraform" => found}}} = run_query("""
        query Terraform($repositoryId: ID!) {
          terraform(repositoryId: $repositoryId, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"repositoryId" => repo.id}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(terraform)
    end
  end
end