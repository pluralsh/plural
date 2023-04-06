defmodule Cron.Prune.Queues do
  @moduledoc """
  Wipes upgrade queues with no activity beyond the expiration time
  """
  use Cron
  alias Core.Schema.{UpgradeQueue, Cluster}
  def run() do
    trim_clusters()

    UpgradeQueue.expired()
    |> UpgradeQueue.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle()
    |> Enum.each(&Core.Services.Upgrades.delete_queue/1)
  end

  def trim_clusters() do
    Cluster.expired()
    |> Core.Repo.delete_all()
  end
end
