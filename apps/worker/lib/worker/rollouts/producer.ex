defmodule Worker.Rollouts.Producer do
  use GenStage
  require Logger
  alias Core.Services.Rollouts

  @max 20
  @poll :timer.seconds(5)

  defmodule State, do: defstruct [:demand]

  def start_link(opts \\ []) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_) do
    :timer.send_interval(@poll, :poll)

    {:producer, %State{demand: 0}}
  end

  def handle_info(:poll, %State{demand: demand} = state) do
    Logger.info "checking for new rollouts"
    deliver(demand, state)
  end

  def handle_demand(demand, %State{demand: remaining} = state) when demand > 0 do
    deliver(demand + remaining, state)
  end

  def handle_demand(_, state), do: {:noreply, [], state}

  defp deliver(demand, state) do
    case Rollouts.poll(min(demand, @max)) do
      {:ok, rollouts} when is_list(rollouts) ->
        {:noreply, rollouts, %{state | demand: demand - length(rollouts)}}
      _ -> {:noreply, [], %{state | demand: demand}}
    end
  end
end
