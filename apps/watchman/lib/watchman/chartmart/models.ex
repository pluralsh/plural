defmodule Watchman.Chartmart.Installation do
  defstruct [:id, :repository]
end

defmodule Watchman.Chartmart.Dashboard do
  defstruct [:name, :uid]
end

defmodule Watchman.Chartmart.Repository do
  defstruct [:id, :icon, :name, :description, :dashboards]
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