defmodule Core.Services.Scan do
  require Logger
  alias Core.Services.{Repositories, Versions}
  alias Core.Schema.{DockerImage, Version, Chart, Terraform}
  alias Core.Docker.TrivySource

  def scan_image(%DockerImage{} = image) do
    %{docker_repository: %{repository: repo} = dkr} = img = Core.Repo.preload(image, [docker_repository: :repository])
    %{publisher: %{owner: owner}} = Core.Repo.preload(repo, [publisher: :owner])

    registry_name = img_name(img)
    {:ok, registry_token} = Repositories.docker_token([:pull], "#{repo.name}/#{dkr.name}", owner)
    env = [{"TRIVY_REGISTRY_TOKEN", registry_token} | Core.conf(:docker_env)]

    image = "#{registry_name}:#{image.tag}"
    Logger.info "Scanning image #{image}"
    case System.cmd("trivy", ["--quiet", "image", "--format", "json", image, "--timeout", "5m0s"], env: env, stderr_to_stdout: true) do
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
        Repositories.retry_scan(img)
    end
  end

  def terrascan(%Version{} = version) do
    {type, url} = terrascan_details(version)
    {output, _} = System.cmd("terrascan", [
      "scan",
      "--iac-type", type,
      "--remote-type", "http",
      "--remote-url", url,
      "--output", "json",
      "--use-colors", "f"
    ])
    Versions.record_scan(output, version)
  end

  defp terrascan_details(%Version{
    version: v,
    chart: %Chart{name: chart, repository: %{name: name}}
  }) do
    {"helm", "http://chartmuseum:8080/cm/#{name}/charts/#{chart}-#{v}.tgz"}
  end
  defp terrascan_details(%Version{terraform: %Terraform{}} = v),
    do: {"terraform", Core.Storage.url({v.package, v}, :original)}

  defp img_name(%DockerImage{docker_repository: %{repository: repo} = dkr}),
    do: "#{Core.conf(:registry)}/#{repo.name}/#{dkr.name}"

  defp insert_vulns(nil, img), do: insert_vulns([], img)
  defp insert_vulns(vulns, img) when is_list(vulns) do
    Logger.info "found #{length(vulns)} vulnerabilities for #{img_name(img)}"
    vulns
    |> Enum.map(&TrivySource.to_vulnerability/1)
    |> Repositories.add_vulnerabilities(img)
  end

  defp log({:ok, %DockerImage{id: id, vulnerabilities: vulns}}) when is_list(vulns) do
    Logger.info "Found #{length(vulns)} vulns for image #{id}"
  end
  defp log(_), do: :ok
end
