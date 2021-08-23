defmodule GraphQl.Schema.Dns do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{Dns, User, Account}

  ecto_enum :dns_record_type, Core.Schema.DnsRecord.Type

  input_object :dns_domain_attributes do
    field :name, non_null(:string)
  end

  input_object :dns_record_attributes do
    field :name,    non_null(:string)
    field :type,    non_null(:dns_record_type)
    field :records, list_of(:string)
  end

  object :dns_domain do
    field :id,   non_null(:id)
    field :name, non_null(:string)

    field :creator, :user, resolve: dataloader(User)
    field :account, :account, resolve: dataloader(Account)

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

  connection node_type: :dns_domain
  connection node_type: :dns_record

  object :dns_queries do
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

      resolve &Dns.create_domain/2
    end

    field :create_dns_record, :dns_record do
      middleware Authenticated
      arg :attributes, non_null(:dns_record_attributes)
      arg :cluster,    non_null(:string)
      arg :provider,   non_null(:provider)

      resolve &Dns.create_record/2
    end

    field :delete_dns_record, :dns_record do
      middleware Authenticated
      arg :name, non_null(:string)
      arg :type, non_null(:dns_record_type)

      resolve &Dns.delete_record/2
    end
  end
end
