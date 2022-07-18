defmodule Worker.DemoProjects.Producer do
  use GenStage
  use Worker.Base
  require Logger
  alias Core.Services.Shell.Demo

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

  def handle_info(:poll, %State{draining: true} = state), do: empty(state)
  def handle_info(:poll, %State{demand: demand} = state) do
    Logger.info "checking for stale demo projects"
    deliver(demand, %{state | draining: FT.K8S.TrafficDrainHandler.draining?()})
  end

  def handle_demand(_, %State{draining: true} = state), do: empty(state)
  def handle_demand(demand, %State{demand: remaining} = state) when demand > 0 do
    deliver(demand + remaining, state)
  end

  def handle_demand(_, state), do: empty(state)

  defp deliver(demand, state) do
    case Demo.poll(min(demand, @max)) do
      {:ok, demos} when is_list(demos) ->
        {:noreply, demos, %{state | demand: demand - length(demos)}}
      _ -> empty(%{state | demand: demand})
    end
  end
end
