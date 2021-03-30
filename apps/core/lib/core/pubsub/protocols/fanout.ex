defprotocol Core.PubSub.Fanout do
  @fallback_to_any true

  def fanout(event)
end

defimpl Core.PubSub.Fanout, for: Any do
  def fanout(_), do: :ok
end

defimpl Core.PubSub.Fanout, for: [Core.PubSub.VersionCreated, Core.PubSub.VersionUpdated] do
  alias Core.Schema.{ChartInstallation, Repository, Webhook}
  require Logger

  @doc """
  On each new helm version, fan out to all installations of that chart,
  and publish webhook updates where a webhook has been created.

  Pushes the whole process through flow for parallelism.  There's no
  checkpointing or persistence, so this must be considered best-effort.
  """
  def fanout(%{item: version}) do
    version = Core.Repo.preload(version, [:chart, :tags])
    ChartInstallation.for_chart(version.chart_id)
    |> ChartInstallation.with_auto_upgrade(version.tags)
    |> ChartInstallation.ignore_version(version.id)
    |> ChartInstallation.preload([installation: [:repository, user: [:webhooks, :queue]]])
    |> ChartInstallation.ordered()
    |> Core.Repo.stream(method: :keyset)
    |> Flow.from_enumerable(stages: 5, max_demand: 20)
    |> Flow.map(&process(&1, version))
    |> Flow.flat_map(fn
      {:ok, inst} ->
        create_upgrade(inst, version)
        |> derive_webhooks()
      {:error, error} ->
        Logger.error "Failed to update #{inspect(error)}"
        []
    end)
    |> Flow.map(&post_webhook(&1, version))
    |> Enum.count()
  end

  defp process(%ChartInstallation{} = inst, version) do
    inst
    |> ChartInstallation.changeset(%{version_id: version.id})
    |> Core.Repo.update()
  end

  defp create_upgrade(
    %ChartInstallation{installation: %{user: user, repository: repo}} = inst,
    %{version: version, chart: %{name: chart}}
  ) do
    {:ok, _} = Core.Services.Upgrades.create_upgrade(%{
      repository_id: repo.id,
      message: "Upgraded #{chart} to #{version}"
    }, user)

    inst
  end

  defp derive_webhooks(%ChartInstallation{installation: %{user: %{webhooks: webhooks}, repository: repo}}),
    do: Enum.map(webhooks, & {repo, &1})
  defp derive_webhooks(_), do: []

  defp post_webhook(
    {%Repository{name: repo}, %Webhook{} = webhook},
    %{version: version, chart: %{name: chart}}
  ) do
    Core.Services.Users.post_webhook(%{
      repository: repo,
      message: "Upgraded #{chart} to #{version}"
    }, webhook)
  end
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.DockerNotification do
  def fanout(%{item: item}) do
    # don't parallelize for now for simplicity
    item
    |> IO.inspect()
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
