defmodule Worker.Conduit.Subscribers.Docker do
  use Conduit.Subscriber
  import Conduit.Message
  alias Core.Docker.TrivySource
  alias Core.Services.Repositories

  require Logger

  def process(message, _opts) do
    case scan_image(message.body) do
      {:ok, _} -> ack(message)
      _ -> nack(message)
    end
  end

  def scan_image(image) do
    %{docker_repository: %{repository: repo} = dkr} = img = Core.Repo.preload(image, [docker_repository: :repository])
    %{publisher: %{owner: owner}} = Core.Repo.preload(repo, [publisher: :owner])

    registry_name  = "#{Worker.conf(:registry)}/#{repo.name}/#{dkr.name}"
    image = "#{registry_name}:#{image.tag}"

    {:ok, registry_token} = Core.Services.Repositories.docker_token([:pull], registry_name, owner)
    IO.inspect(registry_token)
    env = [{"TRIVY_REGISTRY_TOKEN", registry_token} | Worker.conf(:docker_env)]

    Logger.info "Scanning image #{image}"
    case System.cmd("trivy", ["image", "--output", "json", image], env: env) do
      {output, 0} ->
        Jason.decode!(output)
        |> Enum.map(&TrivySource.to_vulnerability/1)
        |> Repositories.add_vulnerabilities(img)
      {output, _} ->
        Logger.info "Trivy failed with: #{output}"
        :error
    end
  end

  defp registry(), do: Application.get_env(:worker, :registry)
end
