defmodule Worker.Docker.Pipeline do
  use Flow
  require Logger

  def start_link(producer) do
    Flow.from_stages([producer], stages: 1, max_demand: 10)
    |> Flow.map(fn img ->
      Logger.info "Scheduling docker scan for #{img.id}"
      img
    end)
    |> Flow.map(&defer_scan/1)
    |> Flow.start_link()
  end

  defp defer_scan(img), do: Core.Conduit.Broker.publish(%Conduit.Message{body: img}, :dkr)
end
