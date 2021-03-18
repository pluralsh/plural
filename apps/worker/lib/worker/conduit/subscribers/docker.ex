defmodule Worker.Conduit.Subscribers.Docker do
  use Conduit.Subscriber
  import Conduit.Message
  alias Core.Docker.TrivySource
  alias Core.Services.Repositories

  def process(message, _opts) do
    case scan_image(message.body) do
      {:ok, _} -> ack(message)
      _ -> nack(message)
    end
  end

  def scan_image(image) do
    %{docker_repository: %{repository: repo} = dkr} = img = Core.Repo.preload(image, [docker_repository: :repository])
    %{publisher: %{owner: owner}} = Core.Repo.preload(repo, [publisher: :owner])
    registry_name  = "#{registry()}/#{repo.name}/#{dkr.name}"
    {:ok, registry_token} = Core.Services.Repositories.docker_token([:pull], registry_name, owner)
    env = [{"TRIVY_REGISTRY_TOKEN", registry_token}]

    case System.cmd("trivy", ["image", "--output", "json", "#{registry_name}:#{image.tag}"], env: env) do
      {output, 0} ->
        vulns = Jason.decode!(output) |> Enum.map(&TrivySource.to_vulnerability/1)
        Repositories.add_vulnerabilities(vulns, img)
      _ -> :error
    end
  end

  defp registry(), do: Application.get_env(:worker, :registry)
end
