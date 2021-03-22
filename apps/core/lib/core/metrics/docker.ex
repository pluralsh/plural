defmodule Core.Metrics.Docker do
  use Core.Metric.Base

  series do
    database "forge"
    measurement "docker_pulls"

    tag :repository
    tag :tag

    field :value
  end

  def repo_query(offset, precision) do
    ~s[
        SELECT sum(value)
        FROM docker_pulls
        WHERE time > now() - #{offset} and "repository" = $repository
        GROUP BY time(#{precision}), *
    ]
  end

  def tag_query(offset, precision) do
    ~s[
        SELECT sum(value)
        FROM docker_pulls
        WHERE time > now() - #{offset} and "repository" = $repository and "tag" = $tag
        GROUP BY time(#{precision})
    ]
  end
end
