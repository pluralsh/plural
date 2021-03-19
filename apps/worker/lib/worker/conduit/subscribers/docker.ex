defmodule Worker.Conduit.Subscribers.Docker do
  use Conduit.Subscriber
  import Conduit.Message
  alias Core.Docker.TrivySource
  alias Core.Services.Repositories
  require Logger

  def process(message, _opts) do
    case scan_image(message.body) do
      {:ok, _} -> ack(message)
      error ->
        Logger.error "Failed scan: #{inspect(error)}"
        nack(message)
    end
  end

  def scan_image(image) do
    %{docker_repository: %{repository: repo} = dkr} = img = Core.Repo.preload(image, [docker_repository: :repository])
    %{publisher: %{owner: owner}} = Core.Repo.preload(repo, [publisher: :owner])

    registry_name  = "#{Worker.conf(:registry)}/#{repo.name}/#{dkr.name}"
    {:ok, registry_token} = Core.Services.Repositories.docker_token([:pull], "#{repo.name}/#{dkr.name}", owner)
    env = [{"TRIVY_REGISTRY_TOKEN", registry_token} | Worker.conf(:docker_env)]

    image = "#{registry_name}:#{image.tag}"
    Logger.info "Scanning image #{image}"
    case System.cmd("trivy", ["--quiet", "image", "--format", "json", image], env: env) do
      {output, 0} ->
        with {:ok, [%{"Vulnerabilities" => vulns} | _]} <- Jason.decode(output) do
          (vulns || [])
          |> Enum.map(&TrivySource.to_vulnerability/1)
          |> Repositories.add_vulnerabilities(img)
        end
      {output, _} ->
        Logger.info "Trivy failed with: #{output}"
        :error
    end
  end
end
