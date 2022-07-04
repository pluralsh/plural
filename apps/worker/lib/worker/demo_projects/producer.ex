defmodule Worker.DemoProjects.Producer do
  use GenStage
  require Logger
  alias Core.Services.Shell.Demo

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
    Logger.info "checking for stale demo projects"
    deliver(demand, state)
  end

  def handle_demand(demand, %State{demand: remaining} = state) when demand > 0 do
    deliver(demand + remaining, state)
  end

  def handle_demand(_, state), do: {:noreply, [], state}

  defp deliver(demand, state) do
    case Demo.poll(min(demand, @max)) do
      {:ok, demos} when is_list(demos) ->
        {:noreply, demos, %{state | demand: demand - length(demos)}}
      _ -> {:noreply, [], %{state | demand: demand}}
    end
  end
end
