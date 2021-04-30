defimpl Core.Rollouts.Rollable, for: [Core.PubSub.VersionCreated, Core.PubSub.VersionUpdated] do
  use Core.Rollable.Base
  alias Core.Schema.{ChartInstallation, TerraformInstallation}

  def name(%Core.PubSub.VersionCreated{}), do: "version:created"
  def name(%Core.PubSub.VersionUpdated{}), do: "version:updated"

  def preload(event), do: preload_event(event, [:chart, :terraform, :tags])

  def query(%{item: %{chart_id: chart_id} = version}) when is_binary(chart_id) do
    ChartInstallation.for_chart(chart_id)
    |> ChartInstallation.with_auto_upgrade(version.tags)
    |> maybe_ignore_version(@for, ChartInstallation, version.id)
    |> ChartInstallation.preload(installation: [:repository])
    |> ChartInstallation.ordered()
  end

  def query(%{item: %{terraform_id: tf_id} = version}) when is_binary(tf_id) do
    TerraformInstallation.for_terraform(tf_id)
    |> TerraformInstallation.with_auto_upgrade(version.tags)
    |> maybe_ignore_version(@for, TerraformInstallation, version.id)
    |> TerraformInstallation.preload(installation: [:repository])
    |> TerraformInstallation.ordered()
  end

  defp maybe_ignore_version(q, Core.PubSub.VersionUpdated, _, _), do: q
  defp maybe_ignore_version(q, _, mod, id), do: mod.ignore_version(q, id)

  def process(%{item: version}, inst) do
    start_transaction()
    |> add_operation(:inst, fn _ ->
      inst
      |> Ecto.Changeset.change(%{version_id: version.id})
      |> Core.Repo.update()
    end)
    |> add_operation(:upgrades, fn %{inst: inst} ->
      deliver_upgrades(inst.installation.user_id, fn queue ->
        Core.Services.Upgrades.create_upgrade(%{
          repository_id: repo_id(version),
          message: "Upgraded #{type(version)} #{pkg_name(version)} to #{version.version}"
        }, queue)
      end)
    end)
    |> execute(extract: :upgrades)
  end

  defp repo_id(%{chart: %{repository_id: repo_id}}), do: repo_id
  defp repo_id(%{terraform: %{repository_id: repo_id}}), do: repo_id

  defp pkg_name(%{chart: %{name: name}}), do: name
  defp pkg_name(%{terraform: %{name: name}}), do: name

  defp type(%{chart: %{id: _}}), do: "chart"
  defp type(_), do: "terraform module"
end
