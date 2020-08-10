defmodule GraphQl.RepositoryQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "repositories" do
    test "It can list repositories for a publisher" do
      publisher    = insert(:publisher)
      repos = insert_list(3, :repository, publisher: publisher)

      {:ok, %{data: %{"repositories" => found}}} = run_query("""
        query Repositories($publisherId: String) {
          repositories(publisherId: $publisherId, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"publisherId" => publisher.id}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(repos)
    end

    test "It can list repositories installed by a user" do
      user = insert(:user)
      installations = insert_list(3, :installation, user: user)
      insert(:repository)

      {:ok, %{data: %{"repositories" => repos}}} = run_query("""
        query {
          repositories(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      found_repos = from_connection(repos)
      assert Enum.map(installations, & &1.repository)
             |> ids_equal(found_repos)
    end

    test "It can list repositories for a tag" do
      user = insert(:user)
      repo  = insert(:repository, tags: [%{tag: "tag", resource_type: :repository}])
      other = insert(:repository, tags: [%{tag: "tag", resource_type: :repository}])
      insert(:repository)

      {:ok, %{data: %{"repositories" => found}}} = run_query("""
        query {
          repositories(first: 5, tag: "tag") {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([repo, other])
    end
  end

  describe "repository" do
    test "It can fetch a repository by id" do
      user = insert(:user)
      repo = insert(:repository, publisher: build(:publisher, owner: user))

      {:ok, %{data: %{"repository" => found}}} = run_query("""
        query Repo($repoId: ID!) {
          repository(id: $repoId) {
            id
            editable
          }
        }
      """, %{"repoId" => repo.id}, %{current_user: user})

      assert found["id"] == repo.id
      assert found["editable"]
    end

    test "it can fetch a repository by name" do
      user = insert(:user)
      repo = insert(:repository)

      {:ok, %{data: %{"repository" => found}}} = run_query("""
        query Repo($name: ID!) {
          repository(name: $name) {
            id
            editable
          }
        }
      """, %{"name" => repo.name}, %{current_user: user})

      assert found["id"] == repo.id
    end

    test "It can sideload installations" do
      %{repository: repo, user: user} = insert(:installation)

      {:ok, %{data: %{"repository" => found}}} = run_query("""
        query Repo($repoId: ID!) {
          repository(id: $repoId) {
            id
            installation {
              user {
                id
              }
            }
            editable
          }
        }
      """, %{"repoId" => repo.id}, %{current_user: user})

      assert found["id"] == repo.id
      assert found["installation"]["user"]["id"] == user.id
      refute found["editable"]
    end

    test "publishers can see their public keys" do
      %{owner: user} = insert(:publisher)
      {:ok, repo} = Core.Services.Repositories.create_repository(%{name: "my repo"}, user)

      {:ok, %{data: %{"repository" => found}}} = run_query("""
        query Repo($id: ID!) {
          repository(id: $id) {
            id
            publicKey
          }
        }
      """, %{"id" => repo.id}, %{current_user: user})

      assert found["id"] == repo.id
      assert found["publicKey"] == repo.public_key
    end

    test "nonpublishers cannot see public keys" do
      %{owner: user} = insert(:publisher)
      {:ok, repo} = Core.Services.Repositories.create_repository(%{name: "my repo"}, user)

      {:ok, %{data: %{"repository" => found}}} = run_query("""
        query Repo($id: ID!) {
          repository(id: $id) {
            id
            publicKey
          }
        }
      """, %{"id" => repo.id}, %{current_user: insert(:user)})

      assert found["id"] == repo.id
      refute found["publicKey"]
    end
  end

  describe "search_repositories" do
    test "It can search for substrings of a repo name" do
      repos = for i <- 1..3, do: insert(:repository, name: "query #{i}")
      insert(:repository)

      {:ok, %{data: %{"searchRepositories" => found}}} = run_query("""
        query SearchRepositories($query: String!) {
          searchRepositories(query: $query, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"query" => "query"}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(repos)
    end
  end

  describe "integrations" do
    test "It will list integrations" do
      repository = insert(:repository)
      integrations = insert_list(3, :integration, repository: repository)

      {:ok, %{data: %{"integrations" => found}}} = run_query("""
        query Integrations($name: String) {
          integrations(repositoryName: $name, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"name" => repository.name}, %{})

      assert from_connection(found)
             |> ids_equal(integrations)
    end

    test "It will list integrations for a tag" do
      repository = insert(:repository)
      first  = insert(:integration, repository: repository, tags: [%{tag: "tag", resource_type: :integration}])
      second = insert(:integration, repository: repository, tags: [%{tag: "tag", resource_type: :integration}])
      insert(:integration, repository: repository)

      {:ok, %{data: %{"integrations" => found}}} = run_query("""
        query Integrations($name: String!, $tag: String!) {
          integrations(repositoryName: $name, tag: $tag, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"name" => repository.name, "tag" => "tag"}, %{})

      assert from_connection(found)
             |> ids_equal([first, second])
    end
  end
end