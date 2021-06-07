defmodule GraphQl.UpgradeQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "upgradeQueues" do
    test "it can list queues for a user" do
      user = insert(:user)
      queues = insert_list(3, :upgrade_queue, user: user)

      {:ok, %{data: %{"upgradeQueues" => found}}} = run_query("""
        query {
          upgradeQueues { id }
        }
      """, %{}, %{current_user: user})

      assert ids_equal(found, queues)
    end
  end

  describe "deferredUpdates" do
    test "it can list deferred updates for a package installation" do
      chart_inst = insert(:chart_installation)
      updates = insert_list(3, :deferred_update, chart_installation: chart_inst)
      insert(:deferred_update)

      {:ok, %{data: %{"deferredUpdate" => found}}} = run_query("""
        query Deferred($chartInst: ID) {
          deferredUpdates(first: 5, chartInstallationId: $chartInst) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(updates)
    end
  end

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

    test "it can fetch a queue by id" do
      queue = insert(:upgrade_queue)

      {:ok, %{data: %{"upgradeQueue" => found}}} = run_query("""
        query Queue($id: ID!) {
          upgradeQueue(id: $id) { id }
        }
      """, %{"id" => queue.id}, %{current_user: queue.user})

      assert found["id"] == queue.id
    end
  end
end
