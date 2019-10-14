defmodule GraphQl do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  import GraphQl.Schema.Helpers
  import_types GraphQl.Schema.Types

  alias GraphQl.Resolvers.{
    User,
    Chart,
    Repository
  }

  def context(ctx) do
    loader =
      Dataloader.new()
      |> Dataloader.add_source(User, User.data(ctx))
      |> Dataloader.add_source(Chart, Chart.data(ctx))
      |> Dataloader.add_source(Repository, Repository.data(ctx))

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  query do
    field :me, :user do
      middleware GraphQl.Middleware.Authenticated
      resolve fn _, %{context: %{current_user: user}} -> {:ok, user} end
    end
  end
end
