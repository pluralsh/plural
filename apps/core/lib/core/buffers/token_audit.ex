defmodule Core.Buffers.TokenAudit do
  use Core.Buffer.Base, state: &build_state/1, lifespan: (5 * 60 * 1000)
  alias Core.Schema.AccessTokenAudit

  defmodule State, do: defstruct [:id, :timestamp, :ip, count: 0]

  def build_state(_) do
    %State{count: 0}
  end

  def handle_call({:submit, {id, timestamp, ip}}, _, %State{count: count} = state) do
    {:reply, :ok, %{state | count: count + 1, id: id, timestamp: timestamp, ip: ip}}
  end

  def handle_call({:swarm, :begin_handoff}, _from, state) do
    {:reply, {:resume, state}, state}
  end

  def handle_cast({:swarm, _, %State{count: old}}, %State{count: new} = state) do
    {:noreply, %{state | count: new + old}}
  end

  def handle_info(:flush, %State{id: id, timestamp: ts, ip: ip, count: count} = state) do
    %AccessTokenAudit{token_id: id, timestamp: ts, ip: ip}
    |> AccessTokenAudit.changeset(%{count: count})
    |> Core.Repo.insert(
      conflict_target: [:token_id, :ip, :timestamp],
      on_conflict: [inc: [count: count]]
    )

    {:stop, :shutdown, state}
  end

  def handle_info(_, state), do: {:noreply, state}
end
