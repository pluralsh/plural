defmodule Watchman.Chartmart.Repositories do
  use Watchman.Chartmart.Base
  alias Watchman.Chartmart.{Connection, Edge, PageInfo, Installation, Repository}

  def list_installations(first, cursor) do
    installation_query()
    |> Client.run(
      prune_variables(%{cursor: cursor, first: first}),
      %Connection{
        pageInfo: %PageInfo{},
        edges: [%Edge{node: %Installation{repository: %Repository{}}}]
      }
    )
  end
end