defmodule GraphQl.RolloutQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "rollouts" do
    test "it can fetch rollouts for a repository" do
      repo = insert(:repository)
      rollouts = insert_list(3, :rollout, repository: repo, event: %Core.PubSub.VersionCreated{})

      {:ok, %{data: %{"rollouts" => found}}} = run_query("""
        query Rollouts($id: ID!) {
          rollouts(repositoryId: $id, first: 5) {
            edges { node { id event } }
          }
        }
      """, %{"id" => repo.id}, %{current_user: insert(:user)})

      found = from_connection(found)
      assert ids_equal(found, rollouts)
      assert Enum.all?(found, & &1["event"] == "version:created")
    end
  end
end
