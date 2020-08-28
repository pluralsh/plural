defmodule Watchman.GraphQl.Resolvers.Build do
  use Watchman.GraphQl.Resolvers.Base, model: Watchman.Schema.Build
  alias Watchman.Schema.Command
  alias Watchman.Services.Builds

  def query(Command, _), do: Command.ordered()
  def query(_, _), do: Build

  def resolve_build(%{id: id}, _), do: {:ok, Builds.get!(id)}

  def list_builds(args, _) do
    Build.ordered()
    |> paginate(args)
  end

  def list_commands(args, %{source: %{id: build_id}}) do
    Command.ordered()
    |> Command.for_build(build_id)
    |> paginate(args)
  end

  def create_build(%{attributes: attrs}, _),
    do: Builds.create(attrs)

  def cancel_build(%{id: id}, _),
    do: Builds.cancel(id)
end