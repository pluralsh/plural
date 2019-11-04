defmodule GraphQl.TerraformQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "#terraform_module" do
    test "It can fetch an individual terraform package" do
      tf = insert(:terraform)

      {:ok, %{data: %{"terraformModule" => found}}} = run_query("""
        query TerraformModule($id: ID!) {
          terraformModule(id: $id) {
            id
          }
        }
      """, %{"id" => tf.id}, %{current_user: insert(:user)})

      assert found["id"] == tf.id
    end
  end

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