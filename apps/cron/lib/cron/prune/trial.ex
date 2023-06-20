defmodule Cron.Prune.Trials do
  @moduledoc """
  it will wipe all expired trial subscriptions
  """
  use Cron
  alias Core.Schema.PlatformSubscription

  def run() do
    PlatformSubscription.expired_trial()
    |> Core.Repo.delete_all()
  end
end
