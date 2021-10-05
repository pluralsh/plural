defmodule Core.Metrics.Docker do
  use Core.Metric.Base

  series do
    database "plural"
    measurement "docker_pulls"

    tag :repository
    tag :tag

    field :value
  end

  def repo_query(offset, precision) do
    ~s[
        SELECT sum(value)
        FROM "plural"#{table()}
        WHERE time > now() - #{offset} and "repository" = $repository
        GROUP BY time(#{precision}), *
    ]
  end

  def tag_query(offset, precision) do
    ~s[
        SELECT sum(value)
        FROM "plural"#{table()}
        WHERE time > now() - #{offset} and "repository" = $repository and "tag" = $tag
        GROUP BY time(#{precision})
    ]
  end

  defp table(), do: Application.get_env(:core, :docker_metrics_table, "..\"docker_pulls\"")
end
