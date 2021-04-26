defmodule Worker.Rollouts.Pipeline do
  use Flow
  require Logger
  alias Core.Services.Rollouts

  def start_link(producer) do
    Flow.from_stages([producer], stages: 3, max_demand: 10)
    |> Flow.map(fn rollout ->
      Logger.info "Processing rollout #{rollout.id}"
      rollout
    end)
    |> Flow.map(&Rollouts.execute/1)
    |> Flow.start_link()
  end
end
