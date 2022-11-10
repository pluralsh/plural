defmodule Worker.Docker.Pipeline do
  use Flow
  require Logger

  def start_link(producer) do
    Flow.from_stages([producer], stages: 1, max_demand: demand())
    |> Flow.map(fn img ->
      Logger.info "Scheduling docker scan for #{img.id}"
      img
    end)
    |> Flow.map(&Worker.Conduit.Subscribers.Docker.scan_image/1)
    |> Flow.start_link()
  end

  defp demand(), do: Core.env("DOCKER_SCAN_PARALLELISM", :int, 1)
end
