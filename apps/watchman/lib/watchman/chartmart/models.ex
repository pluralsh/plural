defmodule Watchman.Chartmart.Installation do
  defstruct [:id, :repository]
end

defmodule Watchman.Chartmart.Repository do
  defstruct [:id, :name, :description]
end

defmodule Watchman.Chartmart.Edge do
  defstruct [:node]
end

defmodule Watchman.Chartmart.PageInfo do
  defstruct [:endCursor, :hasNextPage]
end

defmodule Watchman.Chartmart.Connection do
  defstruct [:edges, :pageInfo]
end