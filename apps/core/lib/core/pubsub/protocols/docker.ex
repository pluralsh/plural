defprotocol Core.Docker.Publishable do
  @fallback_to_any true

  def handle(event)
end

defimpl Core.Docker.Publishable, for: Any do
  def handle(_), do: :ok
end

defimpl Core.Docker.Publishable, for: Core.Docker.Push do
  def handle(%{repository: repo, tag: tag, digest: digest}),
    do: Core.Services.Repositories.create_docker_image(repo, tag, digest)
end