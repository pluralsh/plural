defmodule Core.Buffers.Docker do
  use Core.Buffer.Base, state: &build_state/1, lifespan: 60_000
  alias Core.Schema.ChartInstallation

  defmodule State, do: defstruct [images: []]

  def build_state(_) do
    %State{images: []}
  end

  def handle_call({:submit, img}, _, %State{images: imgs} = state) do
    {:reply, :ok, %{state | images: [img | imgs]}}
  end

  def handle_call({:swarm, :begin_handoff}, _from, state) do
    {:reply, {:resume, state}, state}
  end

  def handle_cast({:swarm, :end_handoff, %State{images: old}}, %State{images: new}) do
    {:noreply, %State{images: new ++ old}}
  end

  def handle_cast({:swarm, :resolve_conflict, old}, state) do
    {:noreply, %State{images: old.images ++ state.images}}
  end

  def handle_info(:flush, %State{images: [_ | _] = imgs} = state) do
    stream_installations(imgs)
    |> Core.Repo.stream(method: :keyset)
    |> Flow.from_enumerable(stages: 5, max_demand: 20)
    |> Flow.flat_map(fn chart_inst ->
        Logger.info "Delivering upgrade for installation: #{chart_inst.installation.id}"
        Core.Upgrades.Utils.for_user(chart_inst.installation.user_id)
        |> Enum.map(& {&1, chart_inst})
    end)
    |> Flow.map(&create_upgrade(&1, imgs))
    |> Enum.count()

    {:stop, :shutdown, state}
  end

  def handle_info(:flush, state), do: {:stop, :shutdown, state}

  def handle_info(_, state), do: {:noreply, state}

  defp stream_installations(imgs) do
    Enum.map(imgs, & &1.id)
    |> Enum.uniq()
    |> ChartInstallation.for_images()
    |> ChartInstallation.ordered()
    |> ChartInstallation.preload(installation: [:repository])
  end

  defp create_upgrade({queue, %{installation: %{repository_id: repo_id}}}, imgs) do
    imgs  = Core.Repo.preload(imgs, [docker_repository: :repository])
    names = Enum.map(imgs, &Core.Docker.Utils.address/1)
    {:ok, up} = Core.Services.Upgrades.create_upgrade(%{
      repository_id: repo_id,
      message: "New images pushed for #{Enum.join(names, ", ")}"
    }, queue)
    up
  end
end
