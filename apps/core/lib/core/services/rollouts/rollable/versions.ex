defimpl Core.Rollouts.Rollable, for: [Core.PubSub.VersionCreated, Core.PubSub.VersionUpdated] do
  use Core.Rollable.Base
  import Core.Rollable.Utils
  alias Core.Services.{Dependencies, Upgrades, Rollouts}
  alias Core.Schema.{ChartInstallation, TerraformInstallation}

  def name(%Core.PubSub.VersionCreated{}), do: "version:created"
  def name(%Core.PubSub.VersionUpdated{}), do: "version:updated"

  def preload(event), do: preload_event(event, [:chart, :terraform, :tags])

  def query(%{item: %{chart_id: chart_id} = version}) when is_binary(chart_id) do
    ChartInstallation.for_chart(chart_id)
    |> ChartInstallation.with_auto_upgrade(version.tags)
    |> maybe_ignore_version(@for, ChartInstallation, version.id)
    |> ChartInstallation.preload(installation: [:repository, :user])
    |> ChartInstallation.ordered()
  end

  def query(%{item: %{terraform_id: tf_id} = version}) when is_binary(tf_id) do
    TerraformInstallation.for_terraform(tf_id)
    |> TerraformInstallation.with_auto_upgrade(version.tags)
    |> maybe_ignore_version(@for, TerraformInstallation, version.id)
    |> TerraformInstallation.preload(installation: [:repository, :user])
    |> TerraformInstallation.ordered()
  end

  defp maybe_ignore_version(q, Core.PubSub.VersionUpdated, _, _), do: q
  defp maybe_ignore_version(q, _, mod, id), do: mod.ignore_version(q, id)

  def process(%{item: version}, %{installation: %{user: user}} = inst) do
    case Dependencies.valid?(version.dependencies, user) do
      true -> directly_install(version, inst)
      false -> Upgrades.create_deferred_update(version.id, inst, user)
    end
  end

  defp directly_install(version, inst) do
    start_transaction()
    |> add_operation(:lock, fn _ -> Rollouts.lock_installation(version, inst) end)
    |> add_operation(:inst, fn %{lock: inst} ->
      inst
      |> Ecto.Changeset.change(%{version_id: version.id})
      |> Core.Repo.update()
    end)
    |> add_operation(:upgrades, fn
      %{inst: %{locked: true} = inst} -> {:ok, []}
      %{inst: inst} -> deliver_upgrades(inst.installation.user_id, fn queue ->
        Core.Services.Upgrades.create_upgrade(%{
          repository_id: repo_id(version),
          message: "Upgraded #{type(version)} #{pkg_name(version)} to #{version.version}"
        }, queue)
      end)
    end)
    |> execute(extract: :upgrades)
  end
end
