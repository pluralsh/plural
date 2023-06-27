defmodule Cron.Prune.Trials do
  @moduledoc """
  it will wipe all expired trial subscriptions
  """
  use Cron
  alias Core.Services.Payments
  alias Core.Schema.PlatformSubscription

  def run() do
    PlatformSubscription.expired_trial()
    |> PlatformSubscription.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle()
    |> Enum.each(&Payments.expire_trial/1)
  end
end
