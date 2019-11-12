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

  describe "uploadTerraform" do
    test "A publisher can update tf" do
      repo = insert(:repository)
      terraform = insert(:terraform, repository: repo)

      {:ok, %{data: %{"uploadTerraform" => tf}}} = run_query("""
        mutation UploadTerraform($id: ID!, $name: String!, $attributes: TerraformAttributes!) {
          uploadTerraform(repositoryId: $id, name: $name, attributes: $attributes) {
            id
            name
            description
          }
        }
      """,
      %{"id" => terraform.repository_id, "name" => terraform.name, "attributes" => %{"description" => "upserted"}},
      %{current_user: repo.publisher.owner})

      assert tf["id"] == terraform.id
      assert tf["name"] == terraform.name
      assert tf["description"] == "upserted"
    end
  end

  describe "installTerraform" do
    test "A user can install terraform against one of their installations" do
      %{repository: repo, user: user} = inst = insert(:installation)
      terraform = insert(:terraform, repository: repo)

      {:ok, %{data: %{"installTerraform" => installed}}} = run_query("""
        mutation InstallTf($id: ID!, $attributes: TerraformInstallationAttributes!) {
          installTerraform(installationId: $id, attributes: $attributes) {
            id
            terraform {
              id
            }
          }
        }
      """, %{"id" => inst.id, "attributes" => %{"terraformId" => terraform.id}}, %{current_user: user})

      assert installed["id"]
      assert installed["terraform"]["id"] == terraform.id
    end
  end

  describe  "uninstallTerraform" do
    test "A user can uninstall" do
      %{repository: repo, user: user} = inst = insert(:installation)
      terraform = insert(:terraform, repository: repo)
      ti = insert(:terraform_installation, terraform: terraform, installation: inst)

      {:ok, %{data: %{"uninstallTerraform" => _}}} = run_query("""
      mutation InstallTf($id: ID!) {
        uninstallTerraform(id: $id) {
          id
        }
      }
      """, %{"id" => ti.id}, %{current_user: user})

      refute refetch(ti)
    end
  end
end