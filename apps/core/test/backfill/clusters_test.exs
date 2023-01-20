defmodule Core.Backfill.ClustersTest do
  use Core.SchemaCase, async: true
  alias Core.Backfill.Clusters

  describe "#from_queues/0" do
    test "it will backfill cluster records from upgrade queues" do
      queues = insert_list(2, :upgrade_queue, provider: :aws)

      Clusters.from_queues()

      for q <- queues do
        cluster = Core.Services.Clusters.get_cluster(q.user.account_id, q.provider, q.name)
        assert refetch(q).cluster_id == cluster.id
      end
    end
  end

  describe "#trim/0" do
    test "it will remove clusters from expired queues" do
      expired = insert_list(3, :cluster)
      for c <- expired,
        do: insert(:upgrade_queue, cluster: c, pinged_at: Timex.now() |> Timex.shift(days: -15))
      %{cluster: cluster} = insert(:upgrade_queue, cluster: build(:cluster))

      Clusters.trim()

      for c <- expired,
        do: refute refetch(c)

      assert refetch(cluster)
    end
  end
end
