defmodule Core.Services.Metrics do
  use Core.Services.Base
  use Nebulex.Caching
  alias Core.Metrics.Docker
  alias Core.Influx
  alias Core.Schema

  @default_offset "1d"
  @default_precision "30m"

  @ttl :timer.hours(6)

  @decorate cacheable(cache: Core.Cache, key: {:platform_metric, name}, opts: [ttl: @ttl])
  def count(name) do
    query(name)
    |> Core.Repo.aggregate(:count)
  end

  defp query(:repositories), do: Schema.Repository
  defp query(:rollouts), do: Schema.Rollout
  defp query(:clusters), do: Schema.UpgradeQueue
  defp query(:publishers), do: Schema.Publisher

  def docker_pull(repo, tag) do
    Docker.new(1, repository: repo, tag: tag)
    |> Influx.write()
  end

  def query_docker_pulls(repo, opts \\ []) do
    offset    = Keyword.get(opts, :offset, @default_offset)
    precision = Keyword.get(opts, :precision, @default_precision)

    with {:ok, _} <- validate_intervals([offset, precision]) do
      Docker.repo_query(offset, precision)
      |> Influx.query(params: %{repository: repo})
      |> response()
    end
  end

  def query_docker_pulls_for_tag(repo, tag, opts \\ []) do
    offset    = Keyword.get(opts, :offset, @default_offset)
    precision = Keyword.get(opts, :precision, @default_precision)

    with {:ok, _} <- validate_intervals([offset, precision]) do
      Docker.tag_query(offset, precision)
      |> Influx.query(params: %{repository: repo, tag: tag})
      |> response()
    end
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

  defp valid_interval?(interval), do: String.match?(interval, ~r/^[0-9]+[smhd]$/)

  defp validate_intervals(intervals) do
    case Enum.find(intervals, &!valid_interval?(&1)) do
      interval when is_binary(interval) -> {:error, "Invalid interval format: #{interval}"}
      _ -> {:ok, intervals}
    end
  end
end
