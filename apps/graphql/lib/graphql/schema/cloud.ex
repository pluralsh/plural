defmodule GraphQl.Schema.Cloud do
  use GraphQl.Schema.Base
  alias Core.Schema.{CloudCluster, ConsoleInstance}
  alias GraphQl.Resolvers.{User, Cloud}

  ecto_enum :cloud_provider, CloudCluster.Cloud
  ecto_enum :console_instance_status, ConsoleInstance.Status
  ecto_enum :console_size, ConsoleInstance.Size

  input_object :console_instance_attributes do
    field :name,   non_null(:string), description: "the name of this instance (globally unique)"
    field :size,   non_null(:console_size), description: "a heuristic size of this instance"
    field :cloud,  non_null(:cloud_provider), description: "the cloud provider to deploy to"
    field :region, non_null(:string), description: "the region to deploy to (provider specific)"
  end

  input_object :console_instance_update_attributes do
    field :size, :console_size
    field :configuration, :console_configuration_update_attributes
  end

  input_object :console_configuration_update_attributes do
    field :encryption_key, :string
  end

  object :console_instance do
    field :id,        non_null(:id)
    field :name,      non_null(:string), description: "the name of this instance (globally unique)"
    field :subdomain, non_null(:string), description: "the subdomain this instance lives under"
    field :url,       non_null(:string), description: "full console url of this instance"
    field :cloud,     non_null(:cloud_provider), description: "the cloud provider hosting this instance"
    field :size,      non_null(:console_size), description: "the heuristic size of this instance"
    field :region,    non_null(:string), description: "the region this instance is hosted in"
    field :status,    non_null(:console_instance_status),
      description: "the provisioning status of this instance, liveness is fetched through the console field"

    field :deleted_at, :datetime, description: "the time this instance was deleted on"

    field :console, :cluster, resolve: &Cloud.resolve_cluster/3
    field :owner,   :user, resolve: dataloader(User)

    timestamps()
  end

  connection node_type: :console_instance

  object :cloud_queries do
    field :console_instance, :console_instance do
      middleware Authenticated
      arg :id, non_null(:id)

      safe_resolve &Cloud.resolve_instance/2
    end

    connection field :console_instances, node_type: :console_instance do
      middleware Authenticated

      safe_resolve &Cloud.list_instances/2
    end
  end

  object :cloud_mutations do
    field :create_console_instance, :console_instance do
      middleware Authenticated
      arg :attributes, non_null(:console_instance_attributes)

      safe_resolve &Cloud.create_instance/2
    end

    field :update_console_instance, :console_instance do
      middleware Authenticated
      arg :id,         non_null(:id)
      arg :attributes, non_null(:console_instance_update_attributes)

      safe_resolve &Cloud.update_instance/2
    end

    field :delete_console_instance, :console_instance do
      middleware Authenticated
      arg :id, non_null(:id)

      safe_resolve &Cloud.delete_instance/2
    end
  end
end
