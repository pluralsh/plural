defmodule Core.Backfill.Clusters do
  alias Core.Schema.{UpgradeQueue, Cluster}

  def from_queues() do
    UpgradeQueue.without_cluster()
    |> UpgradeQueue.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle()
    |> Enum.each(&Core.Services.Clusters.create_from_queue/1)
  end

  def trim() do
    Cluster.for_expired_queue()
    |> Core.Repo.delete_all()
  end
end
