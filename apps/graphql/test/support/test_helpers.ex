defmodule GraphQl.TestHelpers do
  def run_query(query, variables, context \\ %{}),
    do: Absinthe.run(query, GraphQl, variables: variables, context: context)

  def from_connection(%{"edges" => edges}), do: Enum.map(edges, & &1["node"])
end