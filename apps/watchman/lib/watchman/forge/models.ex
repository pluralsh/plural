defmodule Watchman.Forge.Installation do
  defstruct [:id, :repository]
end

defmodule Watchman.Forge.Dashboard do
  defstruct [:name, :uid]
end

defmodule Watchman.Forge.Repository do
  defstruct [:id, :icon, :name, :description, :dashboards]
end

defmodule Watchman.Forge.Edge do
  defstruct [:node]
end

defmodule Watchman.Forge.PageInfo do
  defstruct [:endCursor, :hasNextPage]
end

defmodule Watchman.Forge.Connection do
  defstruct [:edges, :pageInfo]
end