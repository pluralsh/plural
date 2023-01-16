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
end
