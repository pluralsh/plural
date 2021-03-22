defmodule GraphQl.Schema.Metric do
  use GraphQl.Schema.Base

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
end
