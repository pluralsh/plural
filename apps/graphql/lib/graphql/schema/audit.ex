defmodule GraphQl.Schema.Audit do
  use GraphQl.Schema.Base
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
    field :integration_webhook, :integration_webhook, resolve: dataloader(Account)

    field :repository, :repository, resolve: dataloader(Repository)
    field :version,    :version, resolve: dataloader(Version)
    field :image,      :docker_image, resolve: dataloader(Docker)

    timestamps()
  end

  connection node_type: :audit

  object :audit_queries do
    connection field :audits, node_type: :audit do
      middleware Authenticated

      resolve &Audit.list_audits/2
    end
  end
end
