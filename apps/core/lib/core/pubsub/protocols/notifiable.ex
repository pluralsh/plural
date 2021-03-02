defprotocol Core.PubSub.Notifiable do
  @fallback_to_any true
  def notify(event)
end

defmodule Core.PubSub.Notification.Utils do
  def filter_preferences(followers, pref) do
    Enum.filter(followers, fn
      %{preferences: %{^pref => false}} -> false
      _ -> true
    end)
  end
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

  def notify(%{item: %{incident_id: inc_id, id: id, creator_id: actor_id}}) do
    Follower.for_incident(inc_id)
    |> Core.Repo.all()
    |> filter_preferences(:message)
    |> Enum.map(fn %{user_id: user_id} ->
      timestamped(%{
        incident_id: inc_id,
        actor_id: actor_id,
        user_id: user_id,
        message_id: id,
        type: :message
      })
    end)
  end
end
