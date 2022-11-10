defmodule Core.Services.Scan do
  require Logger
  alias Core.Services.Repositories
  alias Core.Schema.{DockerImage}
  alias Core.Docker.TrivySource

  def scan_image(%DockerImage{} = image) do
    %{docker_repository: %{repository: repo} = dkr} = img = Core.Repo.preload(image, [docker_repository: :repository])
    %{publisher: %{owner: owner}} = Core.Repo.preload(repo, [publisher: :owner])

    registry_name  = "#{Core.conf(:registry)}/#{repo.name}/#{dkr.name}"
    {:ok, registry_token} = Repositories.docker_token([:pull], "#{repo.name}/#{dkr.name}", owner)
    env = [{"TRIVY_REGISTRY_TOKEN", registry_token} | Core.conf(:docker_env)]

    image = "#{registry_name}:#{image.tag}"
    Logger.info "Scanning image #{image}"
    case System.cmd("trivy", ["--quiet", "image", "--format", "json", image], env: env) do
      {output, 0} ->
        case Jason.decode(output) do
          {:ok, [%{"Vulnerabilities" => vulns} | _]} -> insert_vulns(vulns, img)
          {:ok, %{"Results" => [_ | _] = res, "SchemaVersion" => 2}} ->
            Enum.flat_map(res, &Map.get(&1, "Vulnerabilities", []))
            |> insert_vulns(img)
            |> log()
          res ->
            Logger.info "irregular trivy output #{inspect(res)}"
            insert_vulns([], img)
            |> log()
        end
      {output, _} ->
        Logger.info "Trivy failed with: #{output}"
        :error
    end
  end

  defp insert_vulns(vulns, img) do
    (vulns || [])
    |> Enum.map(&TrivySource.to_vulnerability/1)
    |> Repositories.add_vulnerabilities(img)
  end

  defp log({:ok, %DockerImage{id: id, vulnerabilities: vulns}}) when is_list(vulns) do
    Logger.info "Found #{length(vulns)} vulns for image #{id}"
  end
  defp log(_), do: :ok
end
