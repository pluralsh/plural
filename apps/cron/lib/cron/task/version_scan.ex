defmodule Cron.Task.VersionScan do
  @moduledoc """
  Grabs all images pending scan and schedules a new scan
  """
  use Cron
  alias Core.Schema.Version

  def run() do
    Version
    |> Version.ordered(asc: :id)
    |> Version.preloaded()
    |> Core.Repo.stream(method: :keyset)
    |> Flow.from_enumerable(stages: 5, max_demand: 5)
    |> Flow.map(&deliver/1)
    |> log()
  end

  defp deliver(%Version{} = version) do
    Logger.info "Scheduling scan for version #{inspect(version)}"
    Core.Conduit.Broker.publish(%Conduit.Message{body: version}, :scan)
  end
end
