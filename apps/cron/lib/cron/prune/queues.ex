defmodule Cron.Prune.Queues do
  @moduledoc """
  Wipes upgrade queues with no activity beyond the expiration time
  """
  use Cron
  alias Core.Schema.UpgradeQueue
  def run() do
    UpgradeQueue.expired()
    |> Core.Repo.delete_all()
  end
end
