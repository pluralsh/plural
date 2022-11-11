defmodule Worker.Upgrades.Pipeline do
  use Flow
  require Logger
  alias Core.Services.Upgrades

  def start_link(producers) do
    Flow.from_stages(producers, stages: 1, max_demand: 10)
    |> Flow.map(fn upgrade ->
      Logger.info "Processing deferred upgrade #{upgrade.id}"
      upgrade
    end)
    |> Flow.map(&Upgrades.deferred_apply/1)
    |> Flow.start_link()
  end
end
