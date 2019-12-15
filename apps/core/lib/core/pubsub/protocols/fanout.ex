defprotocol Core.PubSub.Fanout do
  @fallback_to_any true

  def fanout(event)
end

defimpl Core.PubSub.Fanout, for: Any do
  def fanout(_), do: :ok
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.VersionCreated do
  alias Core.Schema.{ChartInstallation, Repository, Webhook}
  require Logger

  def fanout(%{item: version}) do
    ChartInstallation.for_chart(version.chart_id)
    |> ChartInstallation.with_auto_upgrade()
    |> ChartInstallation.ignore_version(version.id)
    |> ChartInstallation.preload([installation: [:repository, user: :webhooks]])
    |> ChartInstallation.ordered()
    |> Core.Repo.stream(method: :keyset)
    |> Flow.from_enumerable(stages: 5, max_demand: 20)
    |> Flow.map(&process(&1, version))
    |> Flow.flat_map(fn
      {:ok, inst} -> derive_webhooks(inst)
      {:error, error} ->
        Logger.error "Failed to update #{inspect(error)}"
        []
    end)
    |> Flow.map(&post_webhook/1)
    |> Enum.count()
  end

  defp process(%ChartInstallation{} = inst, version) do
    inst
    |> ChartInstallation.changeset(%{version_id: version.id})
    |> Core.Repo.update()
  end

  defp derive_webhooks(%ChartInstallation{installation: %{user: %{webhooks: webhooks}, repository: repo}}),
    do: Enum.map(webhooks, & {repo, &1})
  defp derive_webhooks(_), do: []

  defp post_webhook({%Repository{name: repo}, %Webhook{} = webhook}),
    do: Core.Services.Users.post_webhook(repo, webhook)
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.DockerNotification do
  def fanout(%{item: item}) do
    # don't parallelize for now for simplicity
    Core.Docker.Event.build(item)
    |> Enum.map(&Core.Docker.Publishable.handle/1)
  end
end