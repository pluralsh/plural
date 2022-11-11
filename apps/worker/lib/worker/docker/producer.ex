defmodule Worker.Docker.Producer do
  use Worker.PollProducer
  alias Core.Services.Repositories

  @max 20
  @scan_interval 7

  def start_link(opts \\ []) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_) do
    :timer.send_interval(poll_interval(), :poll)

    {:producer, %State{demand: 0}}
  end

  defp deliver(demand, state) do
    Logger.info "checking for images to scan, available demand: #{demand}"
    case Repositories.poll_docker_images(@scan_interval, min(demand, @max)) do
      {:ok, imgs} ->
        len = length(imgs)
        Logger.info "found #{len} images"
        {:noreply, imgs, demand(state, demand, len)}
      _ -> empty(%{state | demand: demand})
    end
  end

  defp poll_interval() do
    Core.env("DOCKER_SCAN_POLL_INTERVAL", :int, Worker.conf(:docker_interval))
    |> :timer.seconds()
  end
end
