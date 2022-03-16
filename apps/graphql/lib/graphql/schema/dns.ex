defmodule GraphQl.Schema.Dns do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{Dns, User, Account}

  ecto_enum :dns_record_type, Core.Schema.DnsRecord.Type

  input_object :dns_domain_attributes do
    field :name, :string
    field :access_policy, :dns_access_policy_attributes
  end

  input_object :dns_access_policy_attributes do
    field :id,       :id
    field :bindings, list_of(:binding_attributes)
  end

  input_object :dns_record_attributes do
    field :name,    non_null(:string)
    field :type,    non_null(:dns_record_type)
    field :records, list_of(:string)
  end

  object :dns_domain do
    field :id,   non_null(:id)
    field :name, non_null(:string)

    field :access_policy, :dns_access_policy, resolve: dataloader(Dns)
    field :creator, :user, resolve: dataloader(User)
    field :account, :account, resolve: dataloader(Account)

    connection field :dns_records, node_type: :dns_record do
      resolve &Dns.list_records/2
    end

    timestamps()
  end

  object :dns_record do
    field :id,       non_null(:id)
    field :type,     non_null(:dns_record_type)
    field :name,     non_null(:string)
    field :cluster,  non_null(:string)
    field :provider, non_null(:provider)
    field :records,  list_of(:string)

    field :creator, :user, resolve: dataloader(User)
    field :domain,  :dns_domain, resolve: dataloader(Dns)

    timestamps()
  end

  object :dns_access_policy do
    field :id, non_null(:id)
    field :bindings, list_of(:policy_binding), resolve: dataloader(Dns)
    timestamps()
  end

  object :policy_binding do
    field :id,    non_null(:id)
    field :user,  :user, resolve: dataloader(User)
    field :group, :group, resolve: dataloader(Account)

    timestamps()
  end

  connection node_type: :dns_domain
  connection node_type: :dns_record

  object :dns_queries do
    field :dns_domain, :dns_domain do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve &Dns.resolve_domain/2
    end

    connection field :dns_domains, node_type: :dns_domain do
      middleware Authenticated

      resolve &Dns.list_domains/2
    end

    connection field :dns_records, node_type: :dns_record do
      middleware Authenticated
      arg :domain_id, :id
      arg :cluster,   :string
      arg :provider,  :provider

      resolve &Dns.list_records/2
    end
  end

  object :dns_mutations do
    field :create_domain, :dns_domain do
      middleware Authenticated
      arg :attributes, non_null(:dns_domain_attributes)

      safe_resolve &Dns.create_domain/2
    end

    field :update_domain, :dns_domain do
      middleware Authenticated
      arg :id,         non_null(:id)
      arg :attributes, non_null(:dns_domain_attributes)

      safe_resolve &Dns.update_domain/2
    end

    field :delete_domain, :dns_domain do
      middleware Authenticated
      arg :id,         non_null(:id)

      safe_resolve &Dns.delete_domain/2
    end

    field :provision_domain, :dns_domain do
      middleware Authenticated
      arg :name, non_null(:string)

      safe_resolve &Dns.provision_domain/2
    end

    field :create_dns_record, :dns_record do
      middleware Authenticated
      arg :attributes, non_null(:dns_record_attributes)
      arg :cluster,    non_null(:string)
      arg :provider,   non_null(:provider)

      safe_resolve &Dns.create_record/2
    end

    field :delete_dns_record, :dns_record do
      middleware Authenticated
      arg :name, non_null(:string)
      arg :type, non_null(:dns_record_type)

      safe_resolve &Dns.delete_record/2
    end
  end
end
