defmodule Core.TestHelpers do
  def ids_equal(found, expected) do
    found = MapSet.new(ids(found))
    expected = MapSet.new(ids(expected))

    MapSet.equal?(found, expected)
  end

  def uuid(val) do
    random = :crypto.strong_rand_bytes(10)
    <<u0::48, _::4, u1::12, _::2, u2::62>> = <<val::48, random::binary>>
    {:ok, res} = Ecto.UUID.load(<<u0::48, 4::4, u1::12, 2::2, u2::62>>)
    res
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

  def refetch(%{__struct__: schema, id: id}), do: Core.Repo.get(schema, id)
end
