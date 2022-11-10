defmodule Worker.Docker.Producer do
  use GenStage
  use Worker.Base
  require Logger
  alias Core.Services.Repositories

  @max 20
  @scan_interval 7

  defmodule State, do: defstruct [:demand, :draining]

  def start_link(opts \\ []) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_) do
    :timer.send_interval(poll_interval(), :poll)

    {:producer, %State{demand: 0}}
  end

  def handle_info(:poll, %State{draining: true} = state), do: empty(state)
  def handle_info(:poll, %State{demand: demand} = state),
    do: deliver(demand, %{state | draining: FT.K8S.TrafficDrainHandler.draining?()})

  def handle_demand(_, %State{draining: true} = state), do: empty(state)
  def handle_demand(demand, %State{demand: remaining} = state) when demand > 0,
    do: deliver(demand + remaining, state)

  def handle_demand(_, state), do: empty(state)

  defp deliver(demand, state) do
    Logger.info "checking for images to scan, available demand: #{demand}"
    case Repositories.poll_docker_images(@scan_interval, min(demand, @max)) do
      {:ok, imgs} ->
        len = length(imgs)
        Logger.info "found #{len} images"
        {:noreply, imgs, %{state | demand: demand - len}}
      _ -> empty(%{state | demand: demand})
    end
  end

  defp poll_interval() do
    Core.env("DOCKER_SCAN_POLL_INTERVAL", :int, 60)
    |> :timer.seconds()
  end
end
