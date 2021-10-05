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

  def provision() do
    Influx.query("""
    CREATE DATABASE "plural"
    """, method: :post) |> IO.inspect()

    Influx.query("""
    CREATE RETENTION POLICY "two_hours" ON "plural" DURATION 2h REPLICATION 1 DEFAULT
    """, method: :post) |> IO.inspect()

    Influx.query("""
    CREATE RETENTION POLICY "permanent" ON "plural" DURATION INF REPLICATION 1
    """, method: :post) |> IO.inspect()

    Influx.query("""
    CREATE CONTINUOUS QUERY "cq_15m" ON "plural" BEGIN
      SELECT sum(value) as value
      INTO "plural"."permanent"."downsampled_docker_pulls"
      FROM "docker_pulls"
      GROUP BY time(15m), *
    END
    """, method: :post) |> IO.inspect()
  end

  defp parse_value([time, val]), do: %{time: Timex.parse!(time, "{ISO:Extended}"), value: val}
end
