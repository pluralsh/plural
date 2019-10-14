defmodule GraphQl.TestHelpers do
  def run_query(query, variables, context \\ %{}),
    do: Absinthe.run(query, GraphQl, variables: variables, context: context)
end