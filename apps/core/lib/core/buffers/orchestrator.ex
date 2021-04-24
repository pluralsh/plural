defmodule Core.Buffer.Orchestrator do
  alias Core.Buffers.Supervisor

  def submit(buffer, key, job) do
    with {:ok, pid} = Swarm.whereis_or_register_name(
                        {buffer, key}, Supervisor, :start_child, [buffer, key, []]),
      do: buffer.submit(pid, job)
  end
end
