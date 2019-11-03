defmodule GraphQl.Terraform.MutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "#create_terraform" do
    test "A publisher can create a tf package" do
      repo = insert(:repository)

      {:ok, %{data: %{"createTerraform" => tf}}} = run_query("""
        mutation CreateTf($id: ID!, $attributes: TerraformAttributes!) {
          createTerraform(repositoryId: $id, attributes: $attributes) {
            id
            name
          }
        }
      """,
      %{"id" => repo.id, "attributes" => %{"name" => "tf"}},
      %{current_user: repo.publisher.owner})

      assert tf["id"]
      assert tf["name"] == "tf"
    end
  end

  describe "#update_terraform" do
    test "A publisher can update tf" do
      repo = insert(:repository)
      terraform = insert(:terraform, repository: repo)

      {:ok, %{data: %{"updateTerraform" => tf}}} = run_query("""
        mutation CreateTf($id: ID!, $attributes: TerraformAttributes!) {
          updateTerraform(id: $id, attributes: $attributes) {
            id
            name
          }
        }
      """,
      %{"id" => terraform.id, "attributes" => %{"name" => "tf"}},
      %{current_user: repo.publisher.owner})

      assert tf["id"] == terraform.id
      assert tf["name"] == "tf"
    end
  end
end