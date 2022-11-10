defmodule Worker.Upgrades.Producer do
  use Worker.PollProducer, state: [:demand, :type, :draining]
  alias Core.Services.Upgrades

  @max 20
  @poll :timer.seconds(5)

  def start_link(opts \\ []) do
    GenStage.start_link(__MODULE__, opts[:type], name: opts[:name])
  end

  def init(type) do
    :timer.send_interval(@poll, :poll)
    {:producer, %State{demand: 0, type: type}}
  end

  def child_spec(arg) do
    default = %{
      id: arg[:name],
      start: {__MODULE__, :start_link, [arg]}
    }

    Supervisor.child_spec(default, [])
  end

  defp deliver(demand, %State{type: type} = state) do
    case Upgrades.poll_deferred_updates(type, min(demand, @max)) do
      {:ok, updates} when is_list(updates) ->
        {:noreply, updates, demand(state, demand, updates)}
      _ -> empty(%{state | demand: demand})
    end
  end
end
