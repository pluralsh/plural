defprotocol Core.PubSub.Fanout do
  @fallback_to_any true

  def fanout(event)
end

defimpl Core.PubSub.Fanout, for: Any do
  def fanout(_), do: :ok
end

defimpl Core.PubSub.Fanout, for: [Core.PubSub.VersionCreated, Core.PubSub.VersionUpdated] do
  alias Core.Schema.{ChartInstallation, TerraformInstallation}
  require Logger

  @doc """
  On each new helm version, fan out to all installations of that chart,
  and publish webhook updates where a webhook has been created.

  Pushes the whole process through flow for parallelism.  There's no
  checkpointing or persistence, so this must be considered best-effort.
  """
  def fanout(%{item: %{chart_id: id} = version}) when is_binary(id) do
    version = Core.Repo.preload(version, [:chart, :terraform, :tags])

    stream_installations(version)
    |> Core.Repo.stream(method: :keyset)
    |> Flow.from_enumerable(stages: 5, max_demand: 20)
    |> Flow.map(&process(&1, version))
    |> Flow.flat_map(fn
      {:ok, inst} ->
        [create_upgrade(inst, version)]
      {:error, error} ->
        Logger.error "Failed to update #{inspect(error)}"
        []
    end)
    |> Enum.count()
  end

  def stream_installations(%{chart_id: id} = version) when is_binary(id) do
    ChartInstallation.for_chart(id)
    |> ChartInstallation.with_auto_upgrade(version.tags)
    |> ChartInstallation.ignore_version(version.id)
    |> ChartInstallation.preload(installation: [:repository, user: [:queue]])
    |> ChartInstallation.ordered()
  end

  def stream_installatinos(%{terraform_id: id} = version) when is_binary(id) do
    TerraformInstallation.for_terraform(id)
    |> TerraformInstallation.with_auto_upgrade(version.tags)
    |> TerraformInstallation.ignore_version(version.id)
    |> TerraformInstallation.preload(installation: [:repository, user: [:queue]])
    |> TerraformInstallation.ordered()
  end

  defp process(%{} = inst, version) do
    inst
    |> Ecto.Changeset.change(%{version_id: version.id})
    |> Core.Repo.update()
  end

  defp create_upgrade(
    %{installation: %{user: user, repository: repo}} = inst,
    %{version: version, chart: %{name: chart}}
  ) do
    {:ok, _} = Core.Services.Upgrades.create_upgrade(%{
      repository_id: repo.id,
      message: "Upgraded #{type(inst)} #{chart} to #{version}"
    }, user)

    inst
  end

  defp type(%ChartInstallation{}), do: "chart"
  defp type(_), do: "terraform module"
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.DockerNotification do
  def fanout(%{item: item}) do
    # don't parallelize for now for simplicity
    item
    |> Core.Docker.Event.build()
    |> Enum.map(&Core.Docker.Publishable.handle/1)
  end
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.ZoomMeetingCreated do
  def fanout(%{item: %{incident_id: id, join_url: join}, actor: actor}) when is_binary(id) do
    Core.Services.Incidents.create_message(%{
      text: "I just created a zoom meeting, you can join here: #{join}"
    }, id, actor)
  end
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.DockerImageCreated do
  require Logger

  def fanout(%{item: img}) do
    Logger.info "scheduling scan for image #{img.id}"
    Core.Conduit.Broker.publish(%Conduit.Message{body: img}, :dkr)
  end
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.UpgradeCreated do
  require Logger

  def fanout(%{item: up}) do
    Logger.info "enqueueing upgrade #{up.id}"
    Core.Conduit.Broker.publish(%Conduit.Message{body: up}, :upgrade)
  end
end
