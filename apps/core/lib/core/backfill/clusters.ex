defmodule Core.Backfill.Clusters do
  alias Core.Schema.UpgradeQueue

  def from_queues() do
    UpgradeQueue
    |> UpgradeQueue.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle()
    |> Enum.each(&Core.Services.Clusters.create_from_queue/1)
  end
end
