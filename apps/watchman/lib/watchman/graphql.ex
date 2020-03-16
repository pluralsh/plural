defmodule Watchman.GraphQl do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  import Watchman.GraphQl.Helpers
  alias Watchman.GraphQl.Resolvers.{Build, Forge, Webhook, User}
  alias Watchman.Middleware.Authenticated

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
    field :me, :user do
      middleware Authenticated

      resolve fn _, %{context: %{current_user: user}} -> {:ok, user} end
    end

    field :invite, :invite do
      arg :id, non_null(:string)

      resolve &User.resolve_invite/2
    end

    connection field :builds, node_type: :build do
      middleware Authenticated

      resolve &Build.list_builds/2
    end

    connection field :users, node_type: :user do
      middleware Authenticated

      resolve &User.list_users/2
    end

    field :build, :build do
      middleware Authenticated

      arg :id, non_null(:id)

      resolve safe_resolver(&Build.resolve_build/2)
    end

    connection field :installations, node_type: :installation do
      middleware Authenticated

      resolve &Forge.list_installations/2
    end

    connection field :webhooks, node_type: :webhook do
      middleware Authenticated

      resolve &Webhook.list_webhooks/2
    end
  end

  mutation do
    field :sign_in, :user do
      arg :email, non_null(:string)
      arg :password, non_null(:string)

      resolve safe_resolver(&User.signin_user/2)
    end

    field :signup, :user do
      arg :invite_id, non_null(:string)
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.signup_user/2)
    end

    field :create_invite, :invite do
      arg :attributes, non_null(:invite_attributes)

      resolve safe_resolver(&User.create_invite/2)
    end

    field :update_user, :user do
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.update_user/2)
    end

    field :create_build, :build do
      middleware Authenticated

      arg :attributes, non_null(:build_attributes)

      resolve safe_resolver(&Build.create_build/2)
    end

    field :create_webhook, :webhook do
      middleware Authenticated

      arg :attributes, non_null(:webhook_attributes)

      resolve safe_resolver(&Webhook.create_webhook/2)
    end

    field :update_configuration, :configuration do
      middleware Authenticated

      arg :repository, non_null(:string)
      arg :content, non_null(:string)

      resolve safe_resolver(&Forge.update_configuration/2)
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