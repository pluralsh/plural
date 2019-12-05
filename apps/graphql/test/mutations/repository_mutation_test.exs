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
      """, %{"attrs" => %{"name" => "my repo"}}, %{current_user: user})

      assert repo["id"]
      assert repo["name"] == "my repo"
      assert repo["publisher"]["id"] == id
    end
  end

  describe "updateRepository" do
    test "Users can update themselves" do
      user = insert(:user)
      repo = insert(:repository, publisher: build(:publisher, owner: user))

      {:ok, %{data: %{"updateRepository" => updated}}} = run_query("""
        mutation updateRepository($repositoryId: ID!, $name: String) {
          updateRepository(repositoryId: $repositoryId, attributes: {name: $name}) {
            id
            name
          }
        }
      """, %{"repositoryId" => repo.id, "name" => "Updated Repo"}, %{current_user: user})

      assert updated["id"] == repo.id
      assert updated["name"] == "Updated Repo"
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
    test "Users can install repositories" do
      user = insert(:user)
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
end