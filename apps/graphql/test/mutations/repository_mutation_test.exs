defmodule GraphQl.RepositoryMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "createRepository" do
    test "A user can create a repo for his publisher" do
      %{owner: user, id: id} = insert(:publisher)

      {:ok, %{data: %{"createRepository" => repo}}} = run_query("""
        mutation CreateRepository($attrs: RepositoryAttributes!) {
          createRepository(attributes: $attrs) {
            id
            name
            publisher {
              id
            }
          }
        }
      """, %{"attrs" => %{
        "name" => "my repo",
        "integration_resource_definition" => %{
          "name" => "definition",
          "spec" => [
            %{"type" => "STRING", "name" => "str"},
            %{"type" => "OBJECT", "name" => "nest", "spec" => [
              %{"type" => "STRING", "name" => "nested"}
            ]}
          ]
        }
      }}, %{current_user: user})

      assert repo["id"]
      assert repo["name"] == "my repo"
      assert repo["publisher"]["id"] == id
    end
  end

  describe "updateRepository" do
    test "Users can update their repositories" do
      user = insert(:user)
      repo = insert(:repository, publisher: build(:publisher, owner: user))

      {:ok, %{data: %{"updateRepository" => updated}}} = run_query("""
        mutation updateRepository($repositoryName: String!, $name: String, $resource: ResourceDefinitionAttributes) {
          updateRepository(repositoryName: $repositoryName, attributes: {name: $name, integrationResourceDefinition: $resource}) {
            id
            name
          }
        }
      """, %{
        "repositoryName" => repo.name,
        "name" => "Updated Repo",
        "resource" => %{
          "name" => "definition",
          "spec" => [
            %{"type" => "STRING", "name" => "str", "spec" => []},
            %{"type" => "OBJECT", "name" => "nest", "spec" => [
              %{"type" => "STRING", "name" => "nested"}
            ]}
          ]
        }
      }, %{current_user: user})

      assert updated["id"] == repo.id
      assert updated["name"] == "Updated Repo"

      %{integration_resource_definition: def} = Core.Repo.preload(refetch(repo), [:integration_resource_definition])

      assert def.name == "definition"
    end
  end

  describe "deleteRepository" do
    test "Publishers can delete repositories" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)

      {:ok, %{data: %{"deleteRepository" => deleted}}} = run_query("""
        mutation DeleteRepository($id: ID!) {
          deleteRepository(repositoryId: $id) {
            id
          }
        }
      """, %{"id" => repo.id}, %{current_user: user})

      assert deleted["id"] == repo.id
    end
  end

  describe "createInstallation" do
    setup [:setup_root_user]
    test "Users can install repositories", %{user: user} do
      repo = insert(:repository)

      {:ok, %{data: %{"createInstallation" => installation}}} = run_query("""
        mutation CreateInstallation($repositoryId: ID!) {
          createInstallation(repositoryId: $repositoryId) {
            id
            repository {
              id
            }
          }
        }
      """, %{"repositoryId" => repo.id}, %{current_user: user})

      assert installation["repository"]["id"] == repo.id
    end
  end

  describe "updateInstallation" do
    test "Users can update their installations" do
      %{user: user} = inst = insert(:installation)

      {:ok, %{data: %{"updateInstallation" => update}}} = run_query("""
        mutation UpdateInstallation($id: ID!, $attrs: InstallationAttributes!) {
          updateInstallation(id: $id, attributes: $attrs) {
            id
            context
          }
        }
      """,
      %{"id" => inst.id, "attrs" => %{"context" => Jason.encode!(%{"some" => "value"})}},
      %{current_user: user})

      assert update["id"] == inst.id
      assert update["context"]["some"] == "value"
    end
  end

  describe "deleteInstallation" do
    test "Users can delete their installations" do
      %{user: user} = inst = insert(:installation)

      {:ok, %{data: %{"deleteInstallation" => delete}}} = run_query("""
        mutation deleteInstallation($id: ID!) {
          deleteInstallation(id: $id) {
            id
          }
        }
      """, %{"id" => inst.id}, %{current_user: user})

      assert delete["id"] == inst.id
    end
  end

  describe "createIntegration" do
    test "Publishers can create integrations" do
      %{publisher: %{owner: pub}} = repo = insert(:repository,
        integration_resource_definition: build(:resource_definition,
          spec: [
            build(:specification, type: :string, name: "str", required: true)
          ]
        )
      )

      {:ok, %{data: %{"createIntegration" => intg}}} = run_query("""
        mutation CreateIntegration($name: String!, $attrs: IntegrationAttributes!) {
          createIntegration(repositoryName: $name, attributes: $attrs) {
            id
            name
            spec
            tags {
              tag
            }
          }
        }
      """, %{
        "name" => repo.name,
        "attrs" => %{
          "name" => "github",
          "spec" => Jason.encode!(%{"str" => "val"}),
          "tags" => [%{"tag" => "something"}]
        }
      }, %{current_user: pub})

      assert intg["name"] == "github"
      assert intg["spec"]["str"] == "val"
      assert Enum.map(intg["tags"], & &1["tag"]) == ["something"]
    end
  end

  describe "createArtifact" do
    test "Publishers can create artifacts" do
      %{id: id, publisher: %{owner: user}} = insert(:repository)

      {:ok, %{data: %{"createArtifact" => art}}} = run_query("""
        mutation CreateArtifact($id: ID!, $attrs: ArtifactAttributes!) {
          createArtifact(repositoryId: $id, attributes: $attrs) {
            id
            name
            readme
            type
            platform
          }
        }
      """, %{"id" => id, "attrs" => %{
        "name" => "artifact",
        "readme" => "blank",
        "type" => "cli",
        "platform" => "mac"
      }}, %{current_user: user})

      assert art["id"]
      assert art["name"] == "artifact"
      assert art["readme"] == "blank"
      assert art["type"] == "CLI"
      assert art["platform"] == "MAC"
    end
  end
end