defimpl Core.Rollouts.Rollable, for: [Core.PubSub.VersionCreated, Core.PubSub.VersionUpdated] do
  use Core.Rollable.Base
  alias Core.Services.{Dependencies, Upgrades, Payments}
  alias Core.Schema.{ChartInstallation, TerraformInstallation, User}

  def name(%Core.PubSub.VersionCreated{}), do: "version:created"
  def name(%Core.PubSub.VersionUpdated{}), do: "version:updated"

  def preload(event), do: preload_event(event, [:chart, :terraform, :tags])

  def query(%{item: %{chart_id: chart_id} = version}) when is_binary(chart_id) do
    ChartInstallation.for_chart(chart_id)
    |> ChartInstallation.with_auto_upgrade(version.tags)
    |> maybe_ignore_version(@for, ChartInstallation, version.id)
    |> ChartInstallation.preload(installation: [:repository, user: :account])
    |> ChartInstallation.ordered()
  end

  def query(%{item: %{terraform_id: tf_id} = version}) when is_binary(tf_id) do
    TerraformInstallation.for_terraform(tf_id)
    |> TerraformInstallation.with_auto_upgrade(version.tags)
    |> maybe_ignore_version(@for, TerraformInstallation, version.id)
    |> TerraformInstallation.preload(installation: [:repository, user: :account])
    |> TerraformInstallation.ordered()
  end

  def process(%{item: vsn}, %{installation: %{user: %User{upgrade_to: to} = user}} = inst) when is_binary(to) do
    Upgrades.create_deferred_update(%{
      pending: true,
      reasons: reason("waiting for promotion")
    }, vsn.id, inst, user)
  end

  def process(%{item: vsn}, %{installation: %{user: user}, locked: true} = inst) do
    Upgrades.create_deferred_update(%{reasons: reason("installation locked")}, vsn.id, inst, user)
  end

  def process(%{item: version}, %{installation: %{user: user}} = inst) do
    case {Dependencies.valid?(version.dependencies, user), Payments.delinquent?(user)} do
      {true, false} -> Upgrades.install_version(version, inst)
      failed -> Upgrades.create_deferred_update(reasons(failed), version.id, inst, user)
    end
  end

  # defp maybe_ignore_version(q, Core.PubSub.VersionUpdated, _, _), do: q
  defp maybe_ignore_version(q, _, mod, id), do: mod.ignore_version(q, id)

  defp reasons({false, _}), do: %{reasons: reason("missing dependencies")}
  defp reasons({{:locked, _}, _}), do: %{reasons: reason("dependency is locked")}
  defp reasons({_, true}), do: %{reasons: reason("your billing account is delinquent")}
  defp reasons(_), do: %{}

  defp reason(msg), do: [%{message: msg}]
end
