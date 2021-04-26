defimpl Core.Rollouts.Rollable, for: Core.PubSub.DockerImagesPushed do
  alias Core.Schema.ChartInstallation
  def name(_), do: "dkr:pushed"

  def preload(%{item: imgs} = event) do
    imgs = Core.Repo.preload(imgs, [docker_repository: :repository])
    %{event | item: imgs}
  end

  def query(%{item: imgs}) do
    Enum.map(imgs, & &1.id)
    |> Enum.uniq()
    |> ChartInstallation.for_images()
    |> ChartInstallation.preload(installation: [:repository])
    |> ChartInstallation.ordered()
  end

  def process(%{item: imgs}, chart_inst) do
    Core.Upgrades.Utils.for_user(chart_inst.installation.user_id)
    |> Enum.map(fn queue ->
      names = Enum.map(imgs, &Core.Docker.Utils.address/1)
      {:ok, up} = Core.Services.Upgrades.create_upgrade(%{
        repository_id: chart_inst.installation.repository_id,
        message: "New images pushed for #{Enum.join(names, ", ")}"
      }, queue)
      up
    end)
  end
end
