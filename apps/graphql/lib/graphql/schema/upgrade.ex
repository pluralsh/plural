defmodule GraphQl.Schema.Upgrade do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    Upgrade,
    Repository
  }

  ecto_enum :upgrade_type, Core.Schema.Upgrade.Type

  input_object :upgrade_attributes do
    field :message, non_null(:string)
    field :type,    :upgrade_type
  end

  object :upgrade do
    field :id,      non_null(:id)
    field :type,    :upgrade_type
    field :message, :string

    field :repository, :repository, resolve: dataloader(Repository)

    timestamps()
  end

  object :upgrade_mutations do
    field :create_upgrade, :upgrade do
      arg :id,         :id
      arg :name,       :string
      arg :attributes, non_null(:upgrade_attributes)

      resolve &Upgrade.create_upgrade/2
    end
  end
end
