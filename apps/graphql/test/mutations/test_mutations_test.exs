defmodule GraphQl.TestMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "createTest" do
    test "owners can craete tests" do
      %{owner: owner} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)
      insert(:installation, user: owner, repository: repo)

      {:ok, %{data: %{"createTest" => test}}} = run_query("""
        mutation Create($id: ID!, $attrs: TestAttributes!) {
          createTest(repositoryId: $id, attributes: $attrs) {
            id
            status
            promoteTag
            steps { id name description status }
          }
        }
      """, %{"id" => repo.id, "attrs" => %{
        "promoteTag" => "warm",
        "status" => "QUEUED",
        "steps" => [%{"name" => "name", "description" => "description", "status" => "QUEUED"}]
      }}, %{current_user: owner})

      assert test["id"]
      assert test["promoteTag"] == "warm"
      assert test["status"] == "QUEUED"

      [step] = test["steps"]
      assert step["name"] == "name"
      assert step["description"] == "description"
      assert step["status"] == "QUEUED"
    end
  end

  describe "updateTest" do
    test "owners can update tests" do
      owner = insert(:user)
      test  = insert(:test, creator: owner)

      {:ok, %{data: %{"updateTest" => t}}} = run_query("""
        mutation Update($id: ID!, $attrs: TestAttributes!) {
          updateTest(id: $id, attributes: $attrs) {
            id
            status
          }
        }
      """, %{"id" => test.id, "attrs" => %{"status" => "SUCCEEDED"}}, %{current_user: owner})

      assert t["id"] == test.id
      assert t["status"] == "SUCCEEDED"
    end
  end
end
