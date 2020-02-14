defprotocol Watchman.GraphQl.Topic do
  @spec infer(struct, :create | :update | :delete) :: [{atom, binary}]
  def infer(resource, delta)
end

defimpl Watchman.GraphQl.Topic, for: Watchman.Schema.Build do
  def infer(_, _), do: [build_delta: "builds"]
end