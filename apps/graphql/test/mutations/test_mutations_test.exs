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
            name
            status
            promoteTag
            steps { id name description status }
          }
        }
      """, %{"id" => repo.id, "attrs" => %{
        "name" => "example-name",
        "promoteTag" => "warm",
        "status" => "QUEUED",
        "steps" => [%{"name" => "name", "description" => "description", "status" => "QUEUED"}]
      }}, %{current_user: owner})

      assert test["id"]
      assert test["name"] == "example-name"
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

  describe "updateStep" do
    test "owners can update tests" do
      owner = insert(:user)
      step  = insert(:test_step, test: build(:test, creator: owner))

      {:ok, %{data: %{"updateStep" => t}}} = run_query("""
        mutation Update($id: ID!, $attrs: TestStepAttributes!) {
          updateStep(id: $id, attributes: $attrs) {
            id
            status
          }
        }
      """, %{"id" => step.id, "attrs" => %{"status" => "SUCCEEDED"}}, %{current_user: owner})

      assert t["id"] == step.id
      assert t["status"] == "SUCCEEDED"
    end
  end

  describe "publishLogs" do
    test "owners can publish logs" do
      owner = insert(:user)
      step  = insert(:test_step, test: build(:test, creator: owner))

      {:ok, %{data: %{"publishLogs" => t}}} = run_query("""
        mutation Publish($id: ID!, $logs: String!) {
          publishLogs(id: $id, logs: $logs) {
            id
          }
        }
      """, %{"id" => step.id, "logs" => "logz"}, %{current_user: owner})

      assert t["id"] == step.id
    end
  end
end
