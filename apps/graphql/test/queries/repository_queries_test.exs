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
  end

  describe "repository" do
    test "It can fetch a repository by id" do
      repo = insert(:repository)
      user = insert(:user)

      {:ok, %{data: %{"repository" => found}}} = run_query("""
        query Repo($repoId: ID!) {
          repository(id: $repoId) {
            id
          }
        }
      """, %{"repoId" => repo.id}, %{current_user: user})

      assert found["id"] == repo.id
    end
  end
end