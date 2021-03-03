defprotocol Rtc.Channels.Negotiator do
  @fallback_to_any true

  @doc """
  Returns the payload and topics for a graphql subscription event
  """
  @spec negotiate(term) :: {map, keyword}
  def negotiate(event)
end

defmodule Rtc.Channels.NegotiatorHelper do
  def delta(payload, delta) do
    %{delta: delta, payload: payload}
  end
end

defimpl Rtc.Channels.Negotiator, for: Any do
  def negotiate(_), do: :ok
end

defimpl Rtc.Channels.Negotiator, for: [Core.PubSub.IncidentCreated, Core.PubSub.IncidentUpdated] do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{repository_id: repo_id, id: id} = incident}) do
    {delta(incident, delta_name(@for)), [
      incident_delta: "incidents:repos:#{repo_id}",
      incident_delta: "incidents:#{id}",
      incident_delta: "incidents:mine:#{incident.creator_id}"
    ]}
  end

  defp delta_name(Core.PubSub.IncidentCreated), do: :create
  defp delta_name(Core.PubSub.IncidentUpdated), do: :update
end

defimpl Rtc.Channels.Negotiator, for: [
                                    Core.PubSub.IncidentMessageCreated,
                                    Core.PubSub.IncidentMessageUpdated,
                                    Core.PubSub.IncidentMessageDeleted,
                                 ] do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{incident_id: id} = msg}) do
    %{incident: incident} = msg = Core.Repo.preload(msg, [:incident])

    {delta(msg, delta_name(@for)), [
      incident_message_delta: "incidents:msgs:#{id}",
      incident_message_delta: "incidents:msgs:mine:#{incident.creator_id}"
    ]}
  end

  defp delta_name(Core.PubSub.IncidentMessageCreated), do: :create
  defp delta_name(Core.PubSub.IncidentMessageUpdated), do: :update
  defp delta_name(Core.PubSub.IncidentMessageDeleted), do: :delete
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.NotificationCreated do
  def negotiate(%{item: notification}) do
    {notification, [notification: "notifs:#{notification.user_id}"]}
  end
end
