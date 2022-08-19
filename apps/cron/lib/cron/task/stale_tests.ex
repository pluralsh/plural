defmodule Cron.Task.StaleTests do
  @moduledoc """
  Grabs all images pending scan and schedules a new scan
  """
  use Cron
  alias Core.Schema.Test
  alias Core.Services.Tests

  def run() do
    Test.stale()
    |> Test.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Flow.from_enumerable(stages: 2, max_demand: 5)
    |> Flow.map(&Tests.expire/1)
    |> log()
  end
end
