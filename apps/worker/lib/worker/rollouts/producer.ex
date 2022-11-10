defmodule Worker.Rollouts.Producer do
  use Worker.PollProducer
  alias Core.Services.Rollouts

  @max 20
  @poll :timer.seconds(5)

  def start_link(opts \\ []) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_) do
    :timer.send_interval(@poll, :poll)
    {:producer, %State{demand: 0}}
  end

  defp deliver(demand, state) do
    Logger.info "checking for new rollouts"
    case Rollouts.poll(min(demand, @max)) do
      {:ok, rollouts} when is_list(rollouts) ->
        {:noreply, rollouts, demand(state, demand, rollouts)}
      _ -> empty(%{state | demand: demand})
    end
  end
end
