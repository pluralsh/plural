defmodule Watchman.GraphQl do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  import Watchman.GraphQl.Helpers
  alias Watchman.GraphQl.Resolvers.{Build, Chartmart, Webhook}

  import_types Watchman.GraphQl.Schema

  @sources [
    Build
  ]

  def context(ctx) do
    loader = make_dataloader(@sources, ctx)
    Map.put(ctx, :loader, loader)
  end

  defp make_dataloader(sources, ctx) do
    Enum.reduce(sources, Dataloader.new(), fn source, loader ->
      Dataloader.add_source(loader, source, source.data(ctx))
    end)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  query do
    connection field :builds, node_type: :build do
      resolve &Build.list_builds/2
    end

    field :build, :build do
      arg :id, non_null(:id)

      resolve safe_resolver(&Build.resolve_build/2)
    end

    connection field :installations, node_type: :installation do
      resolve &Chartmart.list_installations/2
    end

    connection field :webhooks, node_type: :webhook do
      resolve &Webhook.list_webhooks/2
    end
  end

  mutation do
    field :create_build, :build do
      arg :attributes, non_null(:build_attributes)

      resolve safe_resolver(&Build.create_build/2)
    end

    field :create_webhook, :webhook do
      arg :attributes, non_null(:webhook_attributes)

      resolve safe_resolver(&Webhook.create_webhook/2)
    end
  end

  subscription do
    field :build_delta, :build_delta do
      arg :build_id, :id
      config fn
        %{id: id}, _ -> {:ok, topic: "builds:#{id}"}
        _, _ -> {:ok, topic: "builds"}
      end
    end

    field :command_delta, :command_delta do
      arg :build_id, non_null(:id)

      config fn %{build_id: build_id}, _ -> {:ok, topic: "commands:#{build_id}"} end
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