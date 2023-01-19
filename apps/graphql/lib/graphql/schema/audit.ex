defmodule GraphQl.Schema.Audit do
  use GraphQl.Schema.Base
  alias GraphQl.Middleware.Differentiate
  alias GraphQl.Resolvers.{Audit, User, Repository, Version, Account, Docker}

  object :audit do
    field :id,        non_null(:id)
    field :action,    non_null(:string)
    field :ip,        :string
    field :city,      :string
    field :country,   :string
    field :latitude,  :string
    field :longitude, :string

    field :actor, :user,  resolve: dataloader(User)
    field :group, :group, resolve: dataloader(Account)
    field :role,  :role,  resolve: dataloader(Account)
    field :user,  :user,  resolve: dataloader(User)
    field :integration_webhook, :integration_webhook, resolve: dataloader(Account)

    field :repository, :repository, resolve: dataloader(Repository)
    field :version,    :version, resolve: dataloader(Version)
    field :image,      :docker_image, resolve: dataloader(Docker)

    timestamps()
  end

  object :geo_metric do
    field :country, :string
    field :count,   :integer
  end

  connection node_type: :audit

  object :audit_queries do
    connection field :audits, node_type: :audit do
      middleware Authenticated
      middleware Differentiate, feature: :audit

      resolve &Audit.list_audits/2
    end

    field :audit_metrics, list_of(:geo_metric) do
      middleware Authenticated
      middleware Differentiate, feature: :audit

      resolve &Audit.audit_metrics/2
    end
  end
end
