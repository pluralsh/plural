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
    |> Core.throttle(count: 100, pause: :timer.seconds(1))
    |> Flow.from_enumerable(stages: 10, max_demand: 10)
    |> Flow.map(&deliver/1)
    |> log()
  end

  defp deliver(%PlatformSubscription{} = subscription) do
    Logger.info "sending usage records for account #{subscription.account_id}"
    result = Payments.send_usage(subscription)
    Logger.info "meter result: #{inspect(result)}"
  end
end
