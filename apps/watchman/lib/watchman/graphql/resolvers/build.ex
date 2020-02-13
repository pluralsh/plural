defmodule Watchman.GraphQl.Resolvers.Build do
  use Watchman.GraphQl.Resolvers.Base, model: Watchman.Schema.Build
  alias Watchman.Services.Builds

  def list_builds(args, _) do
    Build.ordered()
    |> paginate(args)
  end

  def create_build(%{attributes: attrs}, _),
    do: Builds.create(attrs)
end