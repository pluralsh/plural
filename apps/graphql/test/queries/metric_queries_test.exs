defmodule GraphQl.MetricQueriesTest do
  use Core.SchemaCase, async: false
  import GraphQl.TestHelpers

  describe "platformMetrics" do
    test "it will fetch core usage metrics from the platform" do
      insert_list(2, :publisher)
      insert_list(3, :rollout)
      insert_list(6, :upgrade_queue)
      insert(:repository)

      {:ok, %{data: %{"platformMetrics" => metrics}}} = run_query("""
        query {
          platformMetrics {
            publishers
            rollouts
            clusters
            repositories
          }
        }
      """, %{})

      assert metrics["publishers"] == 6 # created + rollout publisher + repository publisher
      assert metrics["rollouts"] == 3
      assert metrics["clusters"] == 6
      assert metrics["repositories"] == 4 # created + rollout repository
    end
  end
end
