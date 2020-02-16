defmodule Watchman.Chartmart.Base do
  defmacro __using__(_) do
    quote do
      import Watchman.Chartmart.Base
      import Watchman.Chartmart.Queries
      alias Watchman.Chartmart.Client
    end
  end

  def prune_variables(map) do
    Enum.filter(map, fn {_, v} -> not is_nil(v) end)
    |> Enum.into(%{})
  end
end