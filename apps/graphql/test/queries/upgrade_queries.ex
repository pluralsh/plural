defmodule GraphQl.UpgradeQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "upgradeQueue" do
    test "it can query your upgrade queue" do
      queue = insert(:upgrade_queue)
      upgrades = insert_list(3, :upgrade, queue: queue)

      {:ok, %{data: %{"upgradeQueue" => found}}} = run_query("""
        query {
          upgradeQueue {
            id
            upgrades(first: 5) {
              edges { node { id } }
            }
          }
        }
      """, %{}, %{current_user: queue.user})

      assert found["id"]
      assert from_connection(found["upgrades"])
             |> ids_equal(upgrades)
    end
  end
end
