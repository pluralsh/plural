defmodule GraphQl.Schema.Upgrade do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    User,
    Upgrade,
    Repository
  }

  ecto_enum :upgrade_type, Core.Schema.Upgrade.Type

  input_object :upgrade_attributes do
    field :message, non_null(:string)
    field :type,    :upgrade_type
  end

  object :upgrade_queue do
    field :id,     non_null(:id)
    field :acked, :id

    field :user, :user, resolve: dataloader(User)

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

  connection node_type: :upgrade
  delta :upgrade_queue

  object :upgrade_queries do
    field :upgrade_queue, :upgrade_queue do
      resolve &Upgrade.resolve_queue/2
    end
  end

  object :upgrade_mutations do
    field :create_upgrade, :upgrade do
      arg :id,         :id
      arg :name,       :string
      arg :attributes, non_null(:upgrade_attributes)

      resolve &Upgrade.create_upgrade/2
    end
  end

  object :upgrade_subscriptions do
    field :upgrade, :upgrade do
      config fn _, %{context: %{current_user: %{id: id}}} ->
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
