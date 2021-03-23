defprotocol Core.Docker.Publishable do
  @fallback_to_any true

  def handle(event)
end

defimpl Core.Docker.Publishable, for: Any do
  def handle(_), do: :ok
end

defimpl Core.Docker.Publishable, for: Core.Docker.Push do
  alias Core.Services.Users
  def handle(%{repository: repo, tag: tag, digest: digest, actor: %{"name" => email}}) do
    user = Users.get_user_by_email!(email)
    Core.Services.Repositories.create_docker_image(repo, tag, digest, user)
  end
end

defimpl Core.Docker.Publishable, for: Core.Docker.Pull do
  def handle(%{repository: repo, tag: tag}) when is_binary(tag) and byte_size(tag) > 0,
    do: Core.Services.Metrics.docker_pull(repo, tag)
  def handle(_), do: :ok
end
