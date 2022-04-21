defprotocol Core.PubSub.Notifiable do
  @fallback_to_any true
  def notify(event)
end

defimpl Core.PubSub.Notifiable, for: Any do
  def notify(_), do: :ok
end

defmodule Core.PubSub.Notification.Utils do
  import EEx, only: [eval_file: 2]

  def filter_preferences(followers, pref) do
    Enum.filter(followers, fn
      %{preferences: %{^pref => false}} -> false
      _ -> true
    end)
  end

  def eval(file, ctx) do
    notif_file(file)
    |> eval_file(ctx)
  end

  defp notif_file(file), do: Path.join([:code.priv_dir(:core), "notifications", file])
end

defimpl Core.PubSub.Notifiable, for: Core.PubSub.IncidentUpdated do
  import Core.Services.Base, only: [timestamped: 1]
  import Core.PubSub.Notification.Utils
  alias Core.Schema.Follower

  def notify(%{item: %{id: id}, actor: %{id: actor_id}}) do
    Follower.for_incident(id)
    |> Core.Repo.all()
    |> filter_preferences(:incident_update)
    |> Enum.map(fn %{user_id: user_id} ->
      timestamped(%{
        incident_id: id,
        actor_id: actor_id,
        user_id: user_id,
        type: :incident_update
      })
    end)
  end
end

defimpl Core.PubSub.Notifiable, for: Core.PubSub.IncidentMessageCreated do
  import Core.Services.Base, only: [timestamped: 1]
  import Core.PubSub.Notification.Utils
  alias Core.Schema.Follower

  def notify(%{item: %{incident_id: inc_id, id: id, creator_id: actor_id} = incident}) do
    followers = Follower.for_incident(inc_id) |> Core.Repo.all()
    mention_notifs  = mentions(incident, followers)
    mentioned_users = Enum.into(mention_notifs, MapSet.new(), & &1.user_id)

    followers
    |> filter_preferences(:message)
    |> Enum.filter(& !MapSet.member?(mentioned_users, &1.user_id))
    |> Enum.map(fn %{user_id: user_id} ->
      timestamped(%{
        incident_id: inc_id,
        actor_id: actor_id,
        user_id: user_id,
        message_id: id,
        type: :message
      })
    end)
    |> Enum.concat(mention_notifs)
  end

  defp mentions(%{entities: [_ | _] = entities, incident_id: inc_id, id: id, creator_id: actor_id}, followers) do
    mapped_followers = Enum.into(followers, %{}, fn %{user_id: user_id} = f -> {user_id, f} end)

    entities
    |> Enum.filter(fn %{user_id: user_id} ->
      case Map.get(mapped_followers, user_id) do
        %{preferences: %{mention: true}} -> true
        nil -> true
        _ -> false
      end
    end)
    |> Enum.map(fn %{user_id: user_id} ->
      timestamped(%{
        incident_id: inc_id,
        actor_id: actor_id,
        user_id: user_id,
        message_id: id,
        type: :mention
      })
    end)
  end
  defp mentions(_, _), do: []
end

defimpl Core.PubSub.Notifiable, for: Core.PubSub.InstallationLocked do
  import Core.Services.Base, only: [timestamped: 1]
  import Core.PubSub.Notification.Utils, only: [eval: 2]

  def notify(%{item: inst}) do
    %{installation: %{repository_id: repo_id, user_id: user_id, repository: repo}, version: v} = Core.Repo.preload(inst, [
      :version,
      installation: :repository,
    ])
    [
      timestamped(%{
        type: :locked,
        repository_id: repo_id,
        actor_id: user_id,
        user_id: user_id,
        cli: true,
        msg: eval("locked_inst.eex", repo: repo, deps: v.dependencies),
      })
    ]
  end
end
