defmodule Worker.DemoProjects.Producer do
  use Worker.PollProducer
  alias Core.Services.Shell.Demo

  @max 20
  @poll Worker.conf(:demo_interval) |>  :timer.seconds()

  def start_link(opts \\ []) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_) do
    :timer.send_interval(@poll, :poll)

    {:producer, %State{demand: 0}}
  end

  defp deliver(demand, state) do
    Logger.info "checking for expired demo projects"
    case Demo.poll(min(demand, @max)) do
      {:ok, demos} when is_list(demos) ->
        {:noreply, demos, demand(state, demand, demos)}
      _ -> empty(%{state | demand: demand})
    end
  end
end
