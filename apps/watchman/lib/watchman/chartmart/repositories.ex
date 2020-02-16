defmodule Watchman.Chartmart.Repositories do
  use Watchman.Chartmart.Base
  alias Watchman.Chartmart.{Connection, Edge, PageInfo, Installation, Repository}

  defmodule Query, do: defstruct [:installations]

  def list_installations(first, cursor) do
    installation_query()
    |> Client.run(
      prune_variables(%{cursor: cursor, first: first}),
      %Query{installations: %Connection{
        pageInfo: %PageInfo{},
        edges: [%Edge{node: %Installation{repository: %Repository{}}}]
      }}
    )
    |> case do
      {:ok, %Query{installations: installations}} -> {:ok, installations}
      error -> error
    end
  end
end