defmodule GraphQl.Schema.Metric do
  use GraphQl.Schema.Base
  alias Core.Services.Metrics

  object :metric do
    field :name,   non_null(:string)
    field :tags,   list_of(:metric_tag), resolve: fn
      %{tags: %{} = tags}, _, _ ->
        {:ok, Enum.map(tags, fn {k, v} -> %{name: k, value: v} end)}
      _, _, _ -> {:ok, []}
    end
    field :values, list_of(:metric_value)
  end

  object :metric_tag do
    field :name,  non_null(:string)
    field :value, non_null(:string)
  end

  object :metric_value do
    field :time,  :datetime
    field :value, :integer
  end

  object :platform_metrics do
    field :repositories, :integer, resolve: fn
      _, _, _ -> async_count(:repositories)
    end

    field :rollouts, :integer, resolve: fn
      _, _ -> async_count(:rollouts)
    end

    field :clusters, :integer, resolve: fn
      _, _ -> async_count(:clusters)
    end

    field :publishers, :integer, resolve: fn
      _, _ -> async_count(:publishers)
    end
  end

  object :metric_queries do
    field :platform_metrics, :platform_metrics do
      resolve fn _, _ -> {:ok, %{}} end
    end
  end

  defp async_count(count), do: async(fn -> {:ok, Metrics.count(count)} end)
end
