defmodule GraphQl.Resolvers.Docker do
  use GraphQl.Resolvers.Base, model: Core.Schema.DockerRepository
  alias Core.Schema.{DockerImage}

  def query(DockerImage, _), do: DockerImage
  def query(_, _), do: Core.Schema.DockerRepository

  def list_repositories(%{repository_id: repo} = args, _) do
    DockerRepository.for_repository(repo)
    |> DockerRepository.ordered()
    |> paginate(args)
  end

  def list_images(%{docker_repository_id: repo} = args, _) do
    DockerImage.for_repository(repo)
    |> DockerImage.ordered()
    |> paginate(args)
  end
end