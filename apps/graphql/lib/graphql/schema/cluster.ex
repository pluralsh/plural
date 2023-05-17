defmodule GraphQl.Schema.Cluster do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{User, Account, Upgrade, Cluster}
  alias GraphQl.InstallationLoader

  @desc "Possible cluster sources."
  ecto_enum :source, Core.Schema.Installation.Source

  @desc "Input for creating or updating a cluster."
  input_object :cluster_attributes do
    field :name,        non_null(:string), description: "The name of the cluster."
    field :provider,    non_null(:provider), description: "The cluster's cloud provider."
    field :source,      :source, description: "The source of the cluster."
    field :git_url,     :string, description: "The git repository URL for the cluster."
    field :console_url, :string, description: "The URL of the console running on the cluster."
    field :domain,      :string, description: "The domain name used for applications deployed on the cluster."
  end

  @desc "A Kubernetes cluster that can be used to deploy applications on with Plural."
  object :cluster do
    field :id,           non_null(:id), description: "The ID of the cluster."
    field :name,         non_null(:string), description: "The name of the cluster."
    field :provider,     non_null(:provider), description: "The cluster's cloud provider."
    field :source,       :source, description: "The source of the cluster."
    field :git_url,      :string, description: "The git repository URL for the cluster."
    field :console_url,  :string, description: "The URL of the console running on the cluster."
    field :domain,       :string, description: "The domain name used for applications deployed on the cluster."
    field :pinged_at,    :datetime, description: "The last time the cluster was pinged."
    field :upgrade_info, list_of(:upgrade_info), description: "pending upgrades for each installed app", resolve: fn
      cluster, _, _ -> Cluster.upgrade_info(cluster)
    end

    field :dependency, :cluster_dependency, resolve: dataloader(Cluster), description: "the dependencies a cluster has"

    field :owner,   :user, resolve: dataloader(User), description: "The user that owns the cluster."
    field :account, :account, resolve: dataloader(Account), description: "The account that the cluster belongs to."
    field :queue,   :upgrade_queue, resolve: dataloader(Upgrade), description: "The upgrade queue for applications running on the cluster."

    timestamps()
  end

  @desc "The pending upgrades for a repository"
  object :upgrade_info do
    field :installation, :installation, resolve: fn
      %{installation_id: id}, _, %{context: %{loader: loader}} ->
        manual_dataloader(loader, InstallationLoader, :ids, id)
    end
    field :count, :integer
  end

  @desc "A dependncy reference between clusters"
  object :cluster_dependency do
    field :id, non_null(:id)

    field :cluster,    :cluster, resolve: dataloader(Cluster), description: "the cluster holding this dependency"
    field :dependency, :cluster, resolve: dataloader(Cluster), description: "the source cluster of this dependency"

    timestamps()
  end

  connection node_type: :cluster

  object :cluster_queries do
    @desc "Get a cluster by its ID."
    field :cluster, :cluster do
      arg :id, non_null(:id), description: "The ID of the cluster."

      resolve &Cluster.resolve_cluster/2
    end

    @desc "Get a list of clusters owned by the current account."
    connection field :clusters, node_type: :cluster do
      resolve &Cluster.list_clusters/2
    end
  end

  object :cluster_mutations do
    @desc "Create a new cluster."
    field :create_cluster, :cluster do
      arg :attributes, non_null(:cluster_attributes), description: "The input attributes for the cluster that will be created."

      safe_resolve &Cluster.create_cluster/2
    end

    @desc "adds a dependency for this cluster to gate future upgrades"
    field :create_cluster_dependency, :cluster_dependency do
      # middleware Differentiate, feature: :multi_cluster
      arg :source_id, non_null(:id)
      arg :dest_id,   non_null(:id)

      safe_resolve &Cluster.create_dependency/2
    end

    @desc "deletes a dependency for this cluster and potentially disables promotions entirely"
    field :delete_cluster_dependency, :cluster_dependency do
      # middleware Differentiate, feature: :multi_cluster
      arg :source_id, non_null(:id)
      arg :dest_id,   non_null(:id)

      safe_resolve &Cluster.delete_dependency/2
    end

    @desc "moves up the upgrade waterline for a user"
    field :promote, :user do
      safe_resolve &Cluster.promote/2
    end

    @desc "transfers ownership of a cluster to a service account"
    field :transfer_ownership, :cluster do
      arg :name,  non_null(:string)
      arg :email, non_null(:string)

      safe_resolve &Cluster.transfer_ownership/2
    end

    @desc "Delete a cluster."
    field :delete_cluster, :cluster do
      arg :name,     non_null(:string), description: "The name of the cluster."
      arg :provider, non_null(:provider), description: "The cluster's cloud provider."

      safe_resolve &Cluster.delete_cluster/2
    end
  end
end
