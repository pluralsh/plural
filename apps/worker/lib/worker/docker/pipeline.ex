defmodule Worker.Docker.Pipeline do
  use Flow
  require Logger

  def start_link(producer) do
    Flow.from_stages([producer], stages: parallelism(), max_demand: 1)
    |> Flow.map(fn img ->
      Logger.info "Scheduling docker scan for #{img.id}"
      img
    end)
    |> Flow.map(&Core.Services.Scan.scan_image/1)
    |> Flow.start_link()
  end

  defp parallelism(), do: Core.env("DOCKER_SCAN_PARALLELISM", :int, 1)
end
