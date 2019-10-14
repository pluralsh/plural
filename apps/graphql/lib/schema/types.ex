defmodule GraphQl.Schema.Types do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    User,
    Repository,
    Chart
  }

  object :user do
    field :id, :id
    field :name, non_null(:string)
    field :email, non_null(:string)

    timestamps()
  end

  object :publisher do
    field :id, :id
    field :name, non_null(:string)
    field :owner, :user, resolve: dataloader(User)

    timestamps()
  end

  object :repository do
    field :id, :id
    field :name, non_null(:string)
    field :publisher, :publisher, resolve: dataloader(User)

    timestamps()
  end

  object :chart do
    field :id, :id
    field :name, non_null(:string)
    field :helm, :map
    field :repository, :repository, resolve: dataloader(Repository)

    timestamps()
  end

  object :version do
    field :id, :id
    field :version, non_null(:string)
    field :chart, :chart, resolve: dataloader(Chart)

    timestamps()
  end

  object :installation do
    field :id
    field :repository, :repository, resolve: dataloader(Repository)
    field :user, :user, resolve: dataloader(User)

    timestamps()
  end

  object :chart_installation do
    field :id
    field :chart, :chart, resolve: dataloader(Chart)
    field :version, :version, resolve: dataloader(Chart)
    field :user, :user, resolve: dataloader(User)

    timestamps()
  end

  connection node_type: :user
  connection node_type: :publisher
  connection node_type: :repository
  connection node_type: :chart
  connection node_type: :version
end