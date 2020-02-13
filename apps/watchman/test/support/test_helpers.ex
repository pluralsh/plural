defmodule Watchman.TestHelpers do
  def ids_equal(found, expected) do
    found = MapSet.new(ids(found))
    expected = MapSet.new(ids(expected))

    MapSet.equal?(found, expected)
  end

  def by_ids(models) do
    Enum.into(models, %{}, & {id(&1), &1})
  end

  def ids(list) do
    Enum.map(list, &id/1)
  end

  def id(%{id: id}), do: id
  def id(%{"id" => id}), do: id
  def id(id) when is_binary(id), do: id

  def refetch(%{__struct__: schema, id: id}), do: Watchman.Repo.get(schema, id)

  def run_query(query, variables, context \\ %{}),
    do: Absinthe.run(query, Watchman.GraphQl, variables: variables, context: context)

  def from_connection(%{"edges" => edges}), do: Enum.map(edges, & &1["node"])
end