defmodule Worker.Base do
  defmacro __using__(_) do
    quote do
      import Worker.Base
    end
  end

  def empty(state), do: {:noreply, [], state}
end
