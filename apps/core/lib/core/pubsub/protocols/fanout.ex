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
    version = Core.Repo.preload(version, [:terraform, :tags, [chart: :repository]])
    # ensure rollout is created here
    with {:ok, _} = res <- Core.Services.Rollouts.create_rollout(repo_id(version), %{event | item: version}) do
      Core.broker().publish(%Conduit.Message{body: version}, :scan)
      res
    end
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
  alias Core.Schema.Group
  alias Core.Services.Accounts

  def fanout(%{item: %{account_id: aid} = user}) do
    Group.for_account(aid)
    |> Group.global()
    |> Core.Repo.all()
    |> Enum.each(fn %{id: id} -> Accounts.create_group_member(user, id) end)

    Core.Services.Users.create_reset_token(%{type: :email, email: user.email})
  end
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.UserUpdated do
  alias Core.Services.Users

  def fanout(%{item: %{email_changed: true} = user}) do
    Users.create_reset_token(%{type: :email, email: user.email})
  end
  def fanout(_), do: :ok
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

defimpl Core.PubSub.Fanout, for: Core.PubSub.InstallationDeleted do
  alias Core.Services.Users

  def fanout(%{item: _, actor: user}) do
    case Users.get_provider(user) do
      nil -> Users.update_provider(nil, user)
      _ -> :ok
    end
  end
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.InstallationCreated do
  alias Core.Schema.{Repository, User}
  alias Core.Services.{Users, Shell.Demo}

  @console_deps ~w(console monitoring bootstrap postgres ingress-nginx)

  def fanout(%{item: inst, actor: user}) do
    inst = Core.Repo.preload(inst, [:repository])

    case Demo.get_by_user_id(user.id) do
      nil -> handle(inst.repository, user)
      _ -> :ok
    end
  end

  defp handle(%Repository{name: "console"}, %User{onboarding_checklist: %User.OnboardingChecklist{status: :finished}}), do: :ok
  defp handle(%Repository{name: "console"}, user),
    do: Users.update_user(%{onboarding_checklist: %{status: :console_installed}}, user)

  defp handle(%Repository{name: n}, user) when n not in @console_deps,
    do: Users.update_user(%{onboarding_checklist: %{status: :finished}}, user)

  defp handle(_, _), do: :ok
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.PersistedTokenCreated do
  alias Core.{Schema.User, Services.Users}
  alias Core.Services.Shell.Demo

  def fanout(%{actor: %User{onboarding_checklist: %User.OnboardingChecklist{status: :new}} = user}) do
    case Demo.get_by_user_id(user.id) do
      nil -> Users.update_user(%{onboarding_checklist: %{status: :configured}}, user)
      _ -> :ok
    end
  end
  def fanout(_), do: :ok
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.GroupUpdated do
  alias Core.Services.Accounts
  alias Core.Schema.User

  def fanout(%{item: %{globalized: true} = group}) do
    User.for_account(group.account_id)
    |> User.not_member(group.id)
    |> Core.Repo.all()
    |> Enum.each(fn user -> Accounts.create_group_member(user, group.id) end)
  end
  def fanout(_), do: :ignore
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.TestUpdated do
  def fanout(%{item: %{status: :succeeded} = test}) do
    Core.Services.Tests.promote(test)
  end
  def fanout(_), do: :ok
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.LicensePing do
  @moduledoc """
  records a ping timestamp on license fetches to track health of installations
  """

  def fanout(%{item: %{pinged_at: nil} = inst}), do: record_ping(inst)

  def fanout(%{item: inst}) do
    Timex.now()
    |> Timex.shift(hours: -2)
    |> Timex.after?(inst.pinged_at)
    |> case do
      true -> record_ping(inst)
      _ -> :ok
    end
  end

  defp record_ping(inst) do
    inst
    |> Ecto.Changeset.change(%{pinged_at: Timex.now()})
    |> Core.Repo.update()
  end
end


defimpl Core.PubSub.Fanout, for: [Core.PubSub.RepositoryCreated, Core.PubSub.RepositoryUpdated] do
  def fanout(%{item: repo}), do: Core.Services.Repositories.hydrate(repo)
end

defimpl Core.PubSub.Fanout, for: [Core.PubSub.RoleCreated, Core.PubSub.RoleUpdated] do
  alias Core.Schema.User
  alias Core.PubSub.CacheUser

  def fanout(%{item: role}) do
    User.for_role(role)
    |> Core.Repo.all()
    |> Core.Services.Rbac.preload()
    |> Enum.map(&Core.PubSub.Broadcaster.notify(%CacheUser{item: &1}))
    |> Enum.count()
  end
end
