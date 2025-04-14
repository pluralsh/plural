defprotocol Core.Mcp.Serialization.Proto do
  @doc """
  Serialize a struct to a binary format.
  """
  @fallback_to_any true
  def serialize(struct)
end

defimpl Core.Mcp.Serialization.Proto, for: Any do
  def serialize(_struct), do: nil
end

defimpl Core.Mcp.Serialization.Proto, for: Map do
  def serialize(map) do
    Enum.map(map, fn {k, v} -> {k, Core.Mcp.Serialization.Proto.serialize(v)} end)
    |> Map.new()
  end
end

defimpl Core.Mcp.Serialization.Proto, for: List do
  def serialize(list) do
    Enum.map(list, &Core.Mcp.Serialization.Proto.serialize/1)
  end
end

defimpl Core.Mcp.Serialization.Proto, for: String do
  def serialize(string), do: string
end

defimpl Core.Mcp.Serialization.Proto, for: Integer do
  def serialize(integer), do: integer
end

defimpl Core.Mcp.Serialization.Proto, for: Float do
  def serialize(float), do: float
end

defimpl Core.Mcp.Serialization.Proto, for: BitString do
  def serialize(string), do: string
end

defimpl Core.Mcp.Serialization.Proto, for: Boolean do
  def serialize(boolean), do: boolean
end

defimpl Core.Mcp.Serialization.Proto, for: Atom do
  def serialize(atom), do: atom
end

defimpl Core.Mcp.Serialization.Proto, for: NaiveDateTime do
  def serialize(naive_datetime), do: naive_datetime
end

defimpl Core.Mcp.Serialization.Proto, for: DateTime do
  def serialize(datetime), do: datetime
end
