defmodule Cron.Task.Metering do
  @moduledoc """
  Backfills all repository readmes
  """
  use Cron
  alias Core.Schema.PlatformSubscription
  alias Core.Services.Payments

  def run() do
    PlatformSubscription.metered()
    |> PlatformSubscription.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle(count: 50, pause: :timer.seconds(1))
    |> Flow.from_enumerable(stages: 5, max_demand: 5)
    |> Flow.map(&deliver/1)
    |> log()
  end

  defp deliver(%PlatformSubscription{} = subscription) do
    Logger.info "sending usage records for account #{subscription.account_id}"
    Payments.send_usage(subscription)
  end
end
