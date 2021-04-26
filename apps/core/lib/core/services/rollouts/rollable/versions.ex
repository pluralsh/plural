defimpl Core.Rollouts.Rollable, for: [Core.PubSub.VersionCreated, Core.PubSub.VersionUpdated] do
  alias Core.Schema.{ChartInstallation, TerraformInstallation}

  def name(%Core.PubSub.VersionCreated{}), do: "version:created"
  def name(%Core.PubSub.VersionUpdated{}), do: "version:updated"

  def preload(%{item: version} = event) do
    version = Core.Repo.preload(version, [:chart, :terraform, :tags])
    %{event | item: version}
  end

  def query(%{item: version}), do: stream_installations(version)

  def process(%{item: version}, inst) do
    with {:ok, inst} <- update_installation(inst, version) do
      Core.Upgrades.Utils.for_user(inst.installation.user_id)
      |> Enum.map(fn queue ->
        {:ok, up} = Core.Services.Upgrades.create_upgrade(%{
          repository_id: repo_id(version),
          message: "Upgraded #{type(version)} #{pkg_name(version)} to #{version.version}"
        }, queue)

        up
      end)
    end
  end

  defp repo_id(%{chart: %{repository_id: repo_id}}), do: repo_id
  defp repo_id(%{terraform: %{repository_id: repo_id}}), do: repo_id

  defp pkg_name(%{chart: %{name: name}}), do: name
  defp pkg_name(%{terraform: %{name: name}}), do: name

  defp type(%{chart: %{id: _}}), do: "chart"
  defp type(_), do: "terraform module"

  defp stream_installations(%{chart_id: id} = version) when is_binary(id) do
    ChartInstallation.for_chart(id)
    |> ChartInstallation.with_auto_upgrade(version.tags)
    |> ChartInstallation.ignore_version(version.id)
    |> ChartInstallation.preload(installation: [:repository])
    |> ChartInstallation.ordered()
  end

  defp stream_installations(%{terraform_id: id} = version) when is_binary(id) do
    TerraformInstallation.for_terraform(id)
    |> TerraformInstallation.with_auto_upgrade(version.tags)
    |> TerraformInstallation.ignore_version(version.id)
    |> TerraformInstallation.preload(installation: [:repository])
    |> TerraformInstallation.ordered()
  end

  defp update_installation(%{} = inst, version) do
    inst
    |> Ecto.Changeset.change(%{version_id: version.id})
    |> Core.Repo.update()
  end
end
