defmodule Core.Docker.Utils do
  alias Core.Schema.{DockerImage, DockerRepository}

  def address(%DockerImage{
    tag: tag,
    docker_repository: %DockerRepository{name: name, repository: %{name: repo}}
  }) do
    dkr_dns = Core.conf(:registry)
    "#{dkr_dns}/#{repo}/#{name}:#{tag}"
  end
end
