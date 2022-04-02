defmodule GraphQl.TestQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "tests" do
    test "it can list tests for a repository" do
      repo = insert(:repository)
      tests = insert_list(3, :test, repository: repo)
      insert(:test)

      {:ok, %{data: %{"tests" => found}}} = run_query("""
        query tests($id: ID!) {
          tests(repositoryId: $id, first: 5) {
            edges { node { id } }
          }
        }
      """, %{"id" => repo.id}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(tests)
    end

    test "it can list tests for a version" do
      repo = insert(:repository)
      version = insert(:version, chart: build(:chart, repository: repo))
      tests = insert_list(3, :test, repository: repo)
      for test <- tests,
        do: insert(:test_binding, test: test, version: version)
      insert(:test, repository: repo)

      {:ok, %{data: %{"tests" => found}}} = run_query("""
        query tests($id: ID!) {
          tests(versionId: $id, first: 5) {
            edges { node { id } }
          }
        }
      """, %{"id" => version.id}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(tests)
    end
  end

  describe "test" do
    test "it can fetch a test by id" do
      test = insert(:test)
      steps = insert_list(3, :test_step, test: test)

      {:ok, %{data: %{"test" => t}}} = run_query("""
        query Test($id: ID!) {
          test(id: $id) {
            id
            steps { id }
          }
        }
      """, %{"id" => test.id}, %{current_user: insert(:user)})

      assert t["id"] == test.id
      assert ids_equal(t["steps"], steps)
    end
  end
end
