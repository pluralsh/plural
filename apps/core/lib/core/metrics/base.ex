defmodule Core.Metric.Base do
  defmacro __using__(_opts) do
    quote do
      use Instream.Series
      import Core.Metric.Base

      def new(value, tags \\ []), do: Core.Metric.Base.__new__(__MODULE__, value, tags)
    end
  end

  def __new__(module, value, tags \\ []) do
    series = struct(module, %{})
    %{series | fields: %{series.fields | value: value}, tags: Map.merge(series.tags, Map.new(tags))}
  end
end
