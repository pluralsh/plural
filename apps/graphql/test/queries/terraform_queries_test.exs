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

    test "It can sideload tf installations" do
      %{repository: repo, user: user} = inst = insert(:installation)
      tf = insert(:terraform, repository: repo)
      ti = insert(:terraform_installation, installation: inst, terraform: tf)

      {:ok, %{data: %{"terraformModule" => found}}} = run_query("""
        query TerraformModule($id: ID!) {
          terraformModule(id: $id) {
            id
            installation {
              id
            }
          }
        }
      """, %{"id" => tf.id}, %{current_user: user})

      assert found["id"] == tf.id
      assert found["installation"]["id"] == ti.id
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

  describe "terraformInstallations" do
    test "It can list chart installations for a user" do
      %{repository: repo, user: user} = inst = insert(:installation)
      terraforms = insert_list(3, :terraform, repository: repo)
      insts = for terraform <- terraforms do
        insert(:terraform_installation,
          terraform: terraform,
          installation: inst,
          version: build(:version, terraform: terraform)
        )
      end

      {:ok, %{data: %{"terraformInstallations" => found}}} = run_query("""
        query TfInsts($id: ID!) {
          terraformInstallations(repositoryId: $id, first: 5) {
            edges {
              node {
                id
                version { id }
              }
            }
          }
        }
      """, %{"id" => repo.id}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(insts)
      assert from_connection(found) |> Enum.all?(& &1["version"]["id"])
    end
  end
end