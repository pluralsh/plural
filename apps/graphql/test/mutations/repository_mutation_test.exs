defmodule GraphQl.RepositoryMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  use Mimic

  describe "createRepository" do
    test "A user can create a repo for his publisher" do
      %{owner: user, id: id} = insert(:publisher)

      {:ok, %{data: %{"createRepository" => repo}}} = run_query("""
        mutation CreateRepository($attrs: RepositoryAttributes!) {
          createRepository(attributes: $attrs) {
            id
            name
            publisher { id }
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

    test "users with publish permissions can create repositories" do
      account = insert(:account)
      user = insert(:user, account: account)
      pub  = insert(:publisher, account: account)
      role = insert(:role, account: account, repositories: ["*"], permissions: %{publish: true})
      insert(:role_binding, role: role, user: user)
      user = Core.Services.Rbac.preload(user)

      {:ok, %{data: %{"createRepository" => repo}}} = run_query("""
        mutation CreateRepository($id: ID!, $attrs: RepositoryAttributes!) {
          createRepository(id: $id, attributes: $attrs) {
            id
            name
            publisher { id }
          }
        }
      """, %{"id" => pub.id, "attrs" => %{
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
      assert repo["publisher"]["id"] == pub.id
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

  describe "upsertRepository" do
    test "if the repository doesn't exist it will create" do
      %{owner: user, id: id, name: pub} = insert(:publisher)

      {:ok, %{data: %{"upsertRepository" => repo}}} = run_query("""
        mutation upsertRepository($attrs: RepositoryAttributes!, $name: String!, $publisher: String!) {
          upsertRepository(attributes: $attrs, name: $name, publisher: $publisher) {
            id
            name
            description
            publisher { id }
          }
        }
      """, %{
        "attrs" => %{"description" => "desc"},
        "name" => "my-repo",
        "publisher" => pub,
      }, %{current_user: user})

      assert repo["id"]
      assert repo["name"] == "my-repo"
      assert repo["description"] == "desc"
      assert repo["publisher"]["id"] == id
    end

    test "if the repository exists it will update" do
      %{owner: user, id: id} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)

      {:ok, %{data: %{"upsertRepository" => updated}}} = run_query("""
        mutation upsertRepository($attrs: RepositoryAttributes!, $name: String!, $publisher: String!) {
          upsertRepository(attributes: $attrs, name: $name, publisher: $publisher) {
            id
            name
            description
            publisher { id }
          }
        }
      """, %{
        "attrs" => %{"description" => "desc"},
        "name" => repo.name,
        "publisher" => pub.name,
      }, %{current_user: user})

      assert updated["id"] == repo.id
      assert updated["name"] == repo.name
      assert updated["description"] == "desc"
      assert updated["publisher"]["id"] == id
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

  describe "createOidcProvider" do
    test "it will create an oidc provider for an installation" do
      account = insert(:account)
      installation = insert(:installation, user: build(:user, account: account))
      group = insert(:group, account: account)
      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      expect(HTTPoison, :get, fn _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{issuer: "https://oidc.plural.sh/"})}}
      end)

      {:ok, %{data: %{"createOidcProvider" => provider}}} = run_query("""
        mutation Create($id: ID!, $attributes: OidcAttributes!) {
          createOidcProvider(installationId: $id, attributes: $attributes) {
            id
            clientId
            clientSecret
            redirectUris
            authMethod
            bindings {
              user { id }
              group { id }
            }
            configuration {
              issuer
            }
          }
        }
      """, %{
        "id" => installation.id,
        "attributes" => %{
          "authMethod" => "BASIC",
          "redirectUris" => ["example.com"],
          "bindings" => [%{"groupId" => group.id}]
      }}, %{current_user: installation.user})

      assert provider["id"]
      assert provider["clientId"] == "123"
      assert provider["authMethod"] == "BASIC"
      assert provider["clientSecret"] == "secret"
      assert provider["redirectUris"] == ["example.com"]
      assert provider["configuration"]["issuer"] == "https://oidc.plural.sh/"

      [%{"group" => g}] = provider["bindings"]
      assert g["id"] == group.id
    end
  end

  describe "updateDockerRepository" do
    test "it can set a repo to public" do
      %{owner: user} = pub = insert(:publisher)
      dkr = insert(:docker_repository, repository: build(:repository, publisher: pub))

      {:ok, %{data: %{"updateDockerRepository" => updated}}} = run_query("""
        mutation Update($id: ID!, $attrs: DockerRepositoryAttributes!) {
          updateDockerRepository(id: $id, attributes: $attrs) {
            id
            public
          }
        }
      """, %{"id" => dkr.id, "attrs" => %{"public" => true}}, %{current_user: user})

      assert updated["id"] == dkr.id
      assert updated["public"]
    end
  end

  describe "acquireLock" do
    test "it can acquire an apply lock" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)

      {:ok, %{data: %{"acquireLock" => lock}}} = run_query("""
        mutation Acquire($name: String!) {
          acquireLock(repository: $name) {
            repository { id }
            owner { id }
          }
        }
      """, %{"name" => repo.name}, %{current_user: user})

      assert lock["repository"]["id"] == repo.id
      assert lock["owner"]["id"] == user.id
    end
  end

  describe "releaseLock" do
    test "it will release ownership from an apply lock" do
      %{owner: user} = lock = insert(:apply_lock, owner: build(:user))

      {:ok, %{data: %{"releaseLock" => release}}} = run_query("""
        mutation Release($name: String!, $attrs: ApplyLockAttributes!) {
          releaseLock(repository: $name, attributes: $attrs) {
            id
            lock
            owner { id }
          }
        }
      """, %{"name" => lock.repository.name, "attrs" => %{"lock" => "test"}}, %{current_user: user})

      assert release["id"] == lock.id
      assert release["lock"] == "test"
      refute release["owner"]
    end
  end

  describe "resetInstallations" do
    test "it can reset all a user's installations" do
      user  = insert(:user)
      insts = insert_list(3, :installation, user: user)

      {:ok, %{data: %{"resetInstallations" => 3}}} = run_query("""
        mutation {
          resetInstallations
        }
      """, %{}, %{current_user: user})

      for inst <- insts,
        do: refute refetch(inst)
    end
  end
end
