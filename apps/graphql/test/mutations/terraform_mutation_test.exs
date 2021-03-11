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

  describe "deleteTerraform" do
    test "A publisher can delete tf" do
      %{publisher: pub} = repo = insert(:repository)
      terraform = insert(:terraform, repository: repo)

      {:ok, %{data: %{"deleteTerraform" => del}}} = run_query("""
        mutation DeleteTf($id: ID!) {
          deleteTerraform(id: $id) {
            id
          }
        }
      """, %{"id" => terraform.id}, %{current_user: pub.owner})

      assert del["id"] == terraform.id
      refute refetch(terraform)
    end
  end

  describe "uploadTerraform" do
    test "A publisher can update tf" do
      repo = insert(:repository)
      terraform = insert(:terraform, repository: repo)

      {:ok, %{data: %{"uploadTerraform" => tf}}} = run_query("""
        mutation UploadTerraform($id: String!, $name: String!, $attributes: TerraformAttributes!) {
          uploadTerraform(repositoryName: $id, name: $name, attributes: $attributes) {
            id
            name
            description
          }
        }
      """,
      %{"id" => repo.name, "name" => terraform.name, "attributes" => %{"description" => "upserted"}},
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
      version = insert(:version, terraform: terraform, version: "0.1.0")

      {:ok, %{data: %{"installTerraform" => installed}}} = run_query("""
        mutation InstallTf($id: ID!, $attributes: TerraformInstallationAttributes!) {
          installTerraform(installationId: $id, attributes: $attributes) {
            id
            terraform { id }
            version { id }
          }
        }
      """, %{
        "id" => inst.id,
        "attributes" => %{
          "terraformId" => terraform.id,
          "versionId" => version.id
        }
      }, %{current_user: user})

      assert installed["id"]
      assert installed["terraform"]["id"] == terraform.id
      assert installed["version"]["id"] == version.id
    end

    test "It can update an existing installation" do
      %{repository: repo, user: user} = inst = insert(:installation)
      terraform = insert(:terraform, repository: repo)
      version = insert(:version, terraform: terraform, version: "0.1.0")
      tf_inst = insert(:terraform_installation, terraform: terraform, installation: inst, version: version)
      new_version = insert(:version, terraform: terraform, version: "0.2.0")

      {:ok, %{data: %{"installTerraform" => installed}}} = run_query("""
        mutation InstallTf($id: ID!, $attributes: TerraformInstallationAttributes!) {
          installTerraform(installationId: $id, attributes: $attributes) {
            id
            terraform { id }
            version { id }
          }
        }
      """, %{
        "id" => inst.id,
        "attributes" => %{
          "terraformId" => terraform.id,
          "versionId" => new_version.id
        }
      }, %{current_user: user})

      assert installed["id"] == tf_inst.id
      assert installed["terraform"]["id"] == terraform.id
      assert installed["version"]["id"] == new_version.id
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
