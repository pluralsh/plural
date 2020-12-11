defmodule GraphQl.Schema.Docker do
  use GraphQl.Schema.Base
  alias GraphQl.Middleware.Accessible
  alias GraphQl.Resolvers.{
    Repository,
    Docker
  }

  object :docker_repository do
    field :id,         :id
    field :name,       :string
    field :repository, :repository, resolve: dataloader(Repository)

    timestamps()
  end

  object :docker_image do
    field :id,     :id
    field :tag,    :string
    field :digest, :string

    field :docker_repository, :docker_repository, resolve: dataloader(Docker)

    timestamps()
  end

  connection node_type: :docker_repository
  connection node_type: :docker_image

  object :docker_queries do
    connection field :docker_repositories, node_type: :docker_repository do
      middleware GraphQl.Middleware.Authenticated
      middleware Accessible
      arg :repository_id, non_null(:id)

      resolve &Docker.list_repositories/2
    end

    connection field :docker_images, node_type: :docker_image do
      middleware GraphQl.Middleware.Authenticated
      arg :docker_repository_id, non_null(:id)

      resolve &Docker.list_images/2
    end
  end

  object :docker_mutations do

  end
end