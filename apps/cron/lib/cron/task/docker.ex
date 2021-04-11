defmodule Cron.Task.Docker do
  @moduledoc """
  Grabs all images pending scan and schedules a new scan
  """
  use Cron
  alias Core.Schema.DockerImage

  @scan_interval 7

  def run() do
    DockerImage.scanned_before(@scan_interval)
    |> DockerImage.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Flow.from_enumerable(stages: 5, max_demand: 5)
    |> Flow.map(&deliver/1)
    |> log()
  end

  defp deliver(%DockerImage{} = img) do
    Logger.info "Scheduling scan for img #{img}"
    Core.Conduit.Broker.publish(%Conduit.Message{body: img}, :dkr)
  end
end
