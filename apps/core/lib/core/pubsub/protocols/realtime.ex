defprotocol Core.PubSub.Realtime do
  @fallback_to_any true
  def publish?(event)
end

defimpl Core.PubSub.Realtime, for: Any do
  def publish?(_), do: false
end

defimpl Core.PubSub.Realtime, for: [
  Core.PubSub.IncidentCreated,
  Core.PubSub.IncidentUpdated,
  Core.PubSub.IncidentMessageCreated,
  Core.PubSub.IncidentMessageUpdated,
  Core.PubSub.IncidentMessageDeleted,
  Core.PubSub.NotificationCreated
] do
  def publish?(_), do: true
end
