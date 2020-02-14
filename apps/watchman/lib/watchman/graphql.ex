defmodule Watchman.GraphQl do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  import Watchman.GraphQl.Helpers
  alias Watchman.GraphQl.Resolvers.Build


  import_types Watchman.GraphQl.Schema

  query do
    connection field :builds, node_type: :build do
      resolve &Build.list_builds/2
    end
  end

  mutation do
    field :create_build, :build do
      arg :attributes, non_null(:build_attributes)

      resolve safe_resolver(&Build.create_build/2)
    end
  end

  subscription do
    field :build_delta, :build_delta do
      config fn _, _ -> {:ok, topic: "builds"} end
    end
  end

  def safe_resolver(fun) do
    fn args, ctx ->
      try do
        case fun.(args, ctx) do
          {:ok, res} -> {:ok, res}
          {:error, %Ecto.Changeset{} = cs} -> {:error, resolve_changeset(cs)}
          {:error, {:missing_dep, _}} = error ->
            Core.Services.Dependencies.pretty_print(error)
          error -> error
        end
      rescue
        error -> {:error, Exception.message(error)}
      end
    end
  end
end