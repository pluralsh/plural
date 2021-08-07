defprotocol Core.PubSub.Fanout do
  @fallback_to_any true

  def fanout(event)
end

defimpl Core.PubSub.Fanout, for: Any do
  def fanout(_), do: :ok
end

defimpl Core.PubSub.Fanout, for: [Core.PubSub.VersionCreated, Core.PubSub.VersionUpdated] do
  require Logger

  def fanout(%{item: version} = event) do
    Logger.info "Creating rollout for event #{@for}"
    version = Core.Repo.preload(version, [:chart, :terraform, :tags])
    Core.Services.Rollouts.create_rollout(repo_id(version), %{event | item: version})
  end

  defp repo_id(%{chart: %{repository_id: repo_id}}), do: repo_id
  defp repo_id(%{terraform: %{repository_id: repo_id}}), do: repo_id
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.DockerNotification do
  def fanout(%{item: item}) do
    # don't parallelize for now for simplicity
    item
    |> Core.Docker.Event.build()
    |> Enum.map(&Core.Docker.Publishable.handle/1)
  end
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.UserCreated do
  def fanout(%{item: user}) do
    Core.Services.Users.create_reset_token(%{type: :email, email: user.email})
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
    Core.Buffer.Orchestrator.submit(Core.Buffers.Docker, img.docker_repository.repository_id, img)
    Core.Conduit.Broker.publish(%Conduit.Message{body: img}, :dkr)
  end
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.UpgradeCreated do
  require Logger

  def fanout(%{item: up}) do
    Logger.info "enqueueing upgrade #{up.id}"
    Core.broker().publish(%Conduit.Message{body: up}, :upgrade)
  end
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.AccessTokenUsage do
  def fanout(%{item: token, context: %{ip: ip}}) do
    trunc = Timex.now()
            |> Timex.set(minute: 0, second: 0, microsecond: {0, 6})
    key = "#{token.id}:#{ip}:#{Timex.format!(trunc, "{ISO:Extended}")}"

    Core.Buffer.Orchestrator.submit(Core.Buffers.TokenAudit, key, {token.id, trunc, ip})
  end
end
