defmodule GraphQl.Schema.Upgrade do
  use GraphQl.Schema.Base
  alias GraphQl.Middleware.{Authenticated, UpgradeQueue}
  alias GraphQl.Resolvers.{
    User,
    Upgrade,
    Repository,
    Chart,
    Terraform,
    Version
  }

  ecto_enum :upgrade_type, Core.Schema.Upgrade.Type

  input_object :upgrade_attributes do
    field :message, non_null(:string)
    field :type,    :upgrade_type
  end

  input_object :upgrade_queue_attributes do
    field :name,     non_null(:string)
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

    field :repository, :repository, resolve: dataloader(Repository)

    timestamps()
  end

  object :deferred_update do
    field :id,         non_null(:id)
    field :dequeue_at, :datetime
    field :attempts,   :integer

    field :chart_installation,     :chart_installation, resolve: dataloader(Chart)
    field :terraform_installation, :terraform_installation, resolve: dataloader(Terraform)
    field :version,                :version, resolve: dataloader(Version)

    timestamps()
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
      middleware UpgradeQueue

      arg :id,         :id
      arg :name,       :string
      arg :attributes, non_null(:upgrade_attributes)
      arg :queue_id,   :id

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
