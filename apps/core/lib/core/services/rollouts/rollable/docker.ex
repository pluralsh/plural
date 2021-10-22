defimpl Core.Rollouts.Rollable, for: Core.PubSub.DockerImagesPushed do
  use Core.Rollable.Base
  alias Core.Schema.ChartInstallation

  def name(_), do: "dkr:pushed"

  def preload(event), do: preload_event(event, [docker_repository: :repository])

  def query(%{item: imgs}) do
    Enum.map(imgs, & &1.id)
    |> Enum.uniq()
    |> ChartInstallation.for_images()
    |> ChartInstallation.preload(installation: [:repository])
    |> ChartInstallation.ordered()
  end

  def process(%{item: imgs}, chart_inst) do
    names = Enum.map(imgs, &Core.Docker.Utils.address/1)
    deliver_upgrades(chart_inst.installation.user_id, fn queue ->
      Core.Services.Upgrades.create_upgrade(%{
        repository_id: chart_inst.installation.repository_id,
        type: :bounce,
        message: "New images pushed for #{Enum.join(names, ", ")}"
      }, queue)
    end)
  end
end
