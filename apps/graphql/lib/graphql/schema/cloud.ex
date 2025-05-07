defmodule GraphQl.Schema.Cloud do
  use GraphQl.Schema.Base
  alias Core.Schema.{CloudCluster, ConsoleInstance}
  alias GraphQl.Resolvers.{User, Cloud}

  ecto_enum :cloud_provider, CloudCluster.Cloud
  ecto_enum :console_instance_status, ConsoleInstance.Status
  ecto_enum :console_size, ConsoleInstance.Size
  ecto_enum :console_instance_type, ConsoleInstance.Type

  input_object :console_instance_attributes do
    field :type,    non_null(:console_instance_type), description: "the type of console instance"
    field :name,    non_null(:string), description: "the name of this instance (globally unique)"
    field :size,    non_null(:console_size), description: "a heuristic size of this instance"
    field :cloud,   non_null(:cloud_provider), description: "the cloud provider to deploy to"
    field :region,  non_null(:string), description: "the region to deploy to (provider specific)"
    field :network, :console_network_attributes, description: "use this to add network security settings to this instance"
    field :oidc,    :console_oidc_attributes,    description: "use this to add custom oidc configuration to this instance"
  end

  input_object :console_instance_update_attributes do
    field :size,          :console_size
    field :configuration, :console_configuration_update_attributes
    field :network,       :console_network_attributes
    field :oidc,          :console_oidc_attributes
  end

  input_object :console_configuration_update_attributes do
    field :encryption_key, :string
  end

  input_object :console_network_attributes do
    field :allowed_cidrs, list_of(:string)
  end

  input_object :console_oidc_attributes do
    field :issuer,        :string
    field :client_id,     :string
    field :client_secret, :string
  end

  object :console_instance do
    field :id,        non_null(:id)
    field :type,      non_null(:console_instance_type), description: "whether this is a shared or dedicated console"
    field :name,      non_null(:string), description: "the name of this instance (globally unique)"
    field :subdomain, non_null(:string), description: "the subdomain this instance lives under"
    field :url,       non_null(:string), description: "full console url of this instance"
    field :cloud,     non_null(:cloud_provider), description: "the cloud provider hosting this instance"
    field :size,      non_null(:console_size), description: "the heuristic size of this instance"
    field :region,    non_null(:string), description: "the region this instance is hosted in"

    field :network, :console_instance_network, description: "the network configuration for this instance"
    field :oidc,    :console_instance_oidc,    description: "custom oidc configuration for this instance"

    field :status,    non_null(:console_instance_status),
      description: "the provisioning status of this instance, liveness is fetched through the console field"

    field :deleted_at, :datetime, description: "the time this instance was deleted on"

    field :console, :cluster, resolve: &Cloud.resolve_cluster/3
    field :owner,   :user, resolve: dataloader(User)

    timestamps()
  end

  object :plural_cloud_settings do
    field :regions, :plural_cloud_regions
  end

  object :plural_cloud_regions do
    field :shared,    non_null(:cloud_regions)
    field :dedicated, non_null(:cloud_regions)
  end

  object :cloud_regions do
    field :aws, list_of(:string)
  end

  object :console_instance_network do
    field :allowed_cidrs, list_of(:string)
  end

  object :console_instance_oidc do
    field :issuer,        :string
    field :client_id,     :string
    field :client_secret, :string
  end

  connection node_type: :console_instance

  object :cloud_queries do
    field :cloud_settings, :plural_cloud_settings do
      middleware Authenticated

      resolve &Cloud.resolve_settings/2
    end

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
