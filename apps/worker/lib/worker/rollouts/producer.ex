defmodule Worker.Rollouts.Producer do
  use GenStage
  use Worker.Base
  require Logger
  alias Core.Services.Rollouts

  @max 20
  @poll :timer.seconds(5)

  defmodule State, do: defstruct [:demand, :draining]

  def start_link(opts \\ []) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_) do
    :timer.send_interval(@poll, :poll)

    {:producer, %State{demand: 0}}
  end

  def handle_info(:poll, %State{draining: true} = s), do: empty(s)
  def handle_info(:poll, %State{demand: demand} = state) do
    Logger.info "checking for new rollouts"
    deliver(demand, %{state | draining: FT.K8S.TrafficDrainHandler.draining?()})
  end

  def handle_demand(_, %State{draining: true} = state), do: empty(state)
  def handle_demand(demand, %State{demand: remaining} = state) when demand > 0 do
    deliver(demand + remaining, state)
  end

  def handle_demand(_, state), do: empty(state)

  defp deliver(demand, state) do
    case Rollouts.poll(min(demand, @max)) do
      {:ok, rollouts} when is_list(rollouts) ->
        {:noreply, rollouts, %{state | demand: demand - length(rollouts)}}
      _ -> empty(%{state | demand: demand})
    end
  end
end
