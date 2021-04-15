defmodule Core.Services.Metrics do
  use Core.Services.Base
  alias Core.Metrics.Docker
  alias Core.Influx

  @default_offset "1d"
  @default_precision "30m"

  def docker_pull(repo, tag) do
    Docker.new(1, repository: repo, tag: tag)
    |> Influx.write()
  end

  def query_docker_pulls(repo, opts \\ []) do
    offset    = Keyword.get(opts, :offset, @default_offset)
    precision = Keyword.get(opts, :precision, @default_precision)

    Docker.repo_query(offset, precision)
    |> Influx.query(params: %{repository: repo})
    |> response()
  end

  def query_docker_pulls_for_tag(repo, tag, opts \\ []) do
    offset    = Keyword.get(opts, :offset, @default_offset)
    precision = Keyword.get(opts, :precision, @default_precision)

    Docker.tag_query(offset, precision)
    |> Influx.query(params: %{repository: repo, tag: tag})
    |> response()
  end

  def response(%{results: [%{series: series} | _]}) do
    series
    |> Enum.map(fn %{values: vals} = ser ->
      values = Enum.filter(vals, fn [_, val] -> val end)
               |> Enum.map(&parse_value/1)
      %{ser | values: values}
    end)
    |> ok()
  end
  def response(_), do: {:ok, []}

  defp parse_value([time, val]), do: %{time: Timex.parse!(time, "{ISO:Extended}"), value: val}
end
