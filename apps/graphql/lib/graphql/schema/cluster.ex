defmodule GraphQl.Schema.Cluster do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{User, Account, Upgrade, Cluster}
  ecto_enum :source, Core.Schema.Installation.Source

  input_object :cluster_attributes do
    field :name,        non_null(:string)
    field :provider,    non_null(:provider)
    field :source,      :source
    field :git_url,     :string
    field :console_url, :string
    field :domain,      :string
  end

  object :cluster do
    field :id,          non_null(:id)
    field :name,        non_null(:string)
    field :provider,    non_null(:provider)
    field :source,      :source
    field :git_url,     :string
    field :console_url, :string
    field :domain,      :string
    field :pinged_at,   :datetime

    field :owner,   :user, resolve: dataloader(User)
    field :account, :account, resolve: dataloader(Account)
    field :queue,   :upgrade_queue, resolve: dataloader(Upgrade)

    timestamps()
  end

  connection node_type: :cluster

  object :cluster_queries do
    field :cluster, :cluster do
      arg :id, non_null(:id)

      resolve &Cluster.resolve_cluster/2
    end

    connection field :clusters, node_type: :cluster do
      resolve &Cluster.list_clusters/2
    end
  end

  object :cluster_mutations do
    field :create_cluster, :cluster do
      arg :attributes, non_null(:cluster_attributes)

      safe_resolve &Cluster.create_cluster/2
    end

    field :delete_cluster, :cluster do
      arg :name,     non_null(:string)
      arg :provider, non_null(:provider)

      safe_resolve &Cluster.delete_cluster/2
    end
  end
end
