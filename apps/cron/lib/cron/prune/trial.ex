defmodule Cron.Prune.Trials do
  @moduledoc """
  it will wipe all expired trial subscriptions
  """
  use Cron
  alias Core.Services.Payments
  alias Core.Schema.PlatformSubscription
  require Logger

  def run() do
    PlatformSubscription
    |> PlatformSubscription.ordered(asc: :id)
    |> PlatformSubscription.expired_trial()
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle()
    |> Enum.each(fn sub ->
      Logger.info("Expiring trial for subscription: #{sub.id}")
      Payments.expire_trial(sub)
      |> log_error()
    end)
  end

  defp log_error({:ok, _}), do: :ok
  defp log_error(err) do
    Logger.error("Error expiring trial: #{inspect(err)}")
  end
end
