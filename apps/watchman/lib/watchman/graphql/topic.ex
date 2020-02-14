defprotocol Watchman.GraphQl.Topic do
  @spec infer(struct, :create | :update | :delete) :: [{atom, binary}]
  def infer(resource, delta)
end

defimpl Watchman.GraphQl.Topic, for: Watchman.Schema.Build do
  def infer(%{id: id}, _), do: [build_delta: "builds", build_delta: "builds:#{id}"]
end

defimpl Watchman.GraphQl.Topic, for: Watchman.Schema.Command do
  def infer(%{build_id: build_id}, _), do: [command_delta: "commands:#{build_id}"]
end