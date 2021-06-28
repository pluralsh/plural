defmodule Core.Buffers.Docker do
  use Core.Buffer.Base, state: &build_state/1, lifespan: 5 * 60 * 1000

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
    [img | _] = imgs = Core.Repo.preload(imgs, [docker_repository: :repository])
    event = %Core.PubSub.DockerImagesPushed{item: imgs}
    Core.Services.Rollouts.create_rollout(img.docker_repository.repository_id, event)
    {:stop, :shutdown, state}
  end

  def handle_info(:flush, state), do: {:stop, :shutdown, state}

  def handle_info(_, state), do: {:noreply, state}
end
