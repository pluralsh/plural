defmodule Cron.Task.Usage do
  @moduledoc """
  Grabs all images pending scan and schedules a new scan
  """
  use Cron
  alias Core.Schema.Account
  alias Core.Services.Payments

  def run() do
    Account.usage_updated()
    |> Account.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle(count: 10, pause: 100)
    |> Stream.map(&Payments.sync_usage/1)
    |> log()
  end
end
