defmodule GraphQl.Schema.Rollout do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{Rollout, Repository}

  ecto_enum :rollout_status, Core.Schema.Rollout.Status

  object :rollout do
    field :id,         non_null(:id)
    field :status,     non_null(:rollout_status)
    field :heartbeat,  :datetime
    field :cursor,     :id
    field :count,      :integer
    field :event,      :string, resolve: fn roll, _, _ -> {:ok, Core.Rollouts.Rollable.name(roll.event)} end
    field :repository, :repository, resolve: dataloader(Repository)

    timestamps()
  end

  connection node_type: :rollout
  delta :rollout

  object :rollout_queries do
    connection field :rollouts, node_type: :rollout do
      middleware Authenticated
      arg :repository_id, non_null(:id)
      resolve &Rollout.list_rollouts/2
    end
  end

  object :rollout_mutations do
    field :unlock_repository, :integer do
      middleware Authenticated
      arg :name, non_null(:string)

      resolve &Rollout.unlock/2
    end
  end

  object :rollout_subscriptions do
    field :rollout_delta, :rollout_delta do
      arg :repository_id, non_null(:id)
      config fn %{repository_id: id}, _ -> {:ok, topic: "rollouts:#{id}"} end
    end
  end
end
