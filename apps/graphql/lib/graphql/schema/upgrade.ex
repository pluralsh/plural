defmodule GraphQl.Schema.Upgrade do
  use GraphQl.Schema.Base
  alias GraphQl.Middleware.{Authenticated, Accessible}
  alias GraphQl.Resolvers.{
    User,
    Upgrade,
    Repository,
    Chart,
    Terraform,
    Version
  }

  ecto_enum :upgrade_type, Core.Schema.Upgrade.Type
  ecto_enum :value_type, Core.Schema.Upgrade.ValueType

  @desc "The information for this upgrade"
  input_object :upgrade_attributes do
    field :message, non_null(:string), description: "a simple message to explain this upgrade"
    field :type,    non_null(:upgrade_type), description: "the type of upgrade"
    field :config,  :upgrade_config_attributes, description: "information for a config upgrade"
  end

  @desc "the attributes of the config upgrade"
  input_object :upgrade_config_attributes do
    field :paths, list_of(:upgrade_path_attributes), description: "paths for a configuration change"
  end

  @desc "attributes of a path update"
  input_object :upgrade_path_attributes do
    field :path,  non_null(:string), description: "path the upgrade will occur on, formatted like .some.key[0].here"
    field :value, non_null(:string), description: "the stringified value that will be applied on this path"
    field :type,  non_null(:value_type), description: "the ultimate type of the value"
  end

  input_object :upgrade_queue_attributes do
    field :name,     non_null(:string)
    field :legacy,   :boolean
    field :domain,   :string
    field :git,      :string
    field :provider, :provider
  end

  object :upgrade_queue do
    field :id,        non_null(:id)
    field :acked,     :id
    field :name,      :string
    field :domain,    :string
    field :git,       :string
    field :provider,  :provider
    field :pinged_at, :datetime

    field :user, non_null(:user), resolve: dataloader(User)

    connection field :upgrades, node_type: :upgrade do
      resolve &Upgrade.list_upgrades/2
    end

    timestamps()
  end

  object :upgrade do
    field :id,      non_null(:id)
    field :type,    :upgrade_type
    field :message, :string
    field :config,  :upgrade_config

    field :repository, :repository, resolve: dataloader(Repository)

    timestamps()
  end

  object :upgrade_config do
    field :paths, list_of(:upgrade_path)
  end

  object :upgrade_path do
    field :path,  non_null(:string)
    field :value, non_null(:string)
    field :type,  non_null(:value_type)
  end

  object :deferred_update do
    field :id,         non_null(:id)
    field :dequeue_at, :datetime
    field :attempts,   :integer
    field :pending,    :boolean
    field :messages,   list_of(:deferred_reason)

    field :chart_installation,     :chart_installation, resolve: dataloader(Chart)
    field :terraform_installation, :terraform_installation, resolve: dataloader(Terraform)
    field :version,                :version, resolve: dataloader(Version)

    timestamps()
  end

  object :deferred_reason do
    field :message,    :string
    field :package,    :string
    field :repository, :string
  end

  connection node_type: :upgrade
  connection node_type: :deferred_update

  delta :upgrade_queue

  object :upgrade_queries do
    field :upgrade_queues, list_of(:upgrade_queue) do
      middleware Authenticated

      resolve &Upgrade.list_queues/2
    end

    connection field :deferred_updates, node_type: :deferred_update do
      middleware Authenticated
      arg :chart_installation_id,     :id
      arg :terraform_installation_id, :id

      resolve &Upgrade.list_deferred_updates/2
    end

    field :upgrade_queue, :upgrade_queue do
      middleware Authenticated

      arg :id, :id
      resolve &Upgrade.resolve_queue/2
    end
  end

  object :upgrade_mutations do
    field :create_queue, :upgrade_queue do
      middleware Authenticated
      arg :attributes, non_null(:upgrade_queue_attributes)

      resolve &Upgrade.create_upgrade_queue/2
    end

    field :create_upgrade, :upgrade do
      middleware Authenticated
      middleware Accessible
      arg :repository_name, :string
      arg :repository_id,   :id
      arg :queue,           non_null(:string)
      arg :attributes,      non_null(:upgrade_attributes)

      resolve &Upgrade.create_upgrade/2
    end
  end

  object :upgrade_subscriptions do
    field :upgrade, :upgrade do
      arg :id, :id
      config fn
        %{id: id}, %{current_user: user} when is_binary(id) ->
          with {:ok, _} <- Core.Services.Upgrades.authorize(id, user),
            do: {:ok, topic: "queues:#{id}"}
        _, %{context: %{current_user: %{id: id}}} ->
          {:ok, topic: "upgrades:#{id}"}
      end
    end

    field :upgrade_queue_delta, :upgrade_queue_delta do
      config fn _, %{context: %{current_user: %{id: id}}} ->
        {:ok, topic: "upgrades:queue:#{id}"}
      end
    end
  end
end
