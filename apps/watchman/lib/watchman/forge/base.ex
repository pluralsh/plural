defmodule Watchman.Forge.Base do
  defmacro __using__(_) do
    quote do
      import Watchman.Forge.Base
      import Watchman.Forge.Queries
      alias Watchman.Forge.Client
    end
  end

  def prune_variables(map) do
    Enum.filter(map, fn {_, v} -> not is_nil(v) end)
    |> Enum.into(%{})
  end
end