defmodule Worker.Base do
  defmacro __using__(_) do
    quote do
      import Worker.Base
    end
  end

  def empty(state), do: {:noreply, [], state}

  def drain(state), do: %{state | draining: FT.K8S.TrafficDrainHandler.draining?()}

  def demand(%{} = state, d, v) when is_integer(v), do: %{state | demand: d - v}
  def demand(%{} = state, d, l) when is_list(l), do: %{state | demand: d - length(l)}
end
