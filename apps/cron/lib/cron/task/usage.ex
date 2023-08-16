defmodule Cron.Task.Usage do
  @moduledoc """
  Grabs all images pending scan and schedules a new scan
  """
  use Cron
  alias Core.Schema.Account
  alias Core.Services.{Payments, Accounts}

  def run() do
    Account.usage_updated()
    |> Account.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle(count: 10, pause: 100)
    |> Stream.map(&sync_usage/1)
    |> log()
  end

  defp sync_usage(%Account{} = account) do
    with {:ok, account} <- Accounts.recompute_usage(account),
      do: Payments.sync_usage(account)
  end
  defp sync_usage(_), do: :ok
end
