defmodule GraphQl.Resolvers.Docker do
  use GraphQl.Resolvers.Base, model: Core.Schema.DockerRepository
  alias Core.Schema.{DockerImage, Vulnerability, ImageDependency}
  alias Core.Services.Repositories

  def query(DockerImage, _), do: DockerImage
  def query(Vulnerability, _), do: Vulnerability
  def query(ImageDependency, _), do: ImageDependency
  def query(_, _), do: DockerRepository

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

  def resolve_image(%{id: id}, _), do: {:ok, Repositories.get_dkr_image!(id)}

  def update_docker_repository(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Repositories.update_docker_repository(attrs, id, user)
end
