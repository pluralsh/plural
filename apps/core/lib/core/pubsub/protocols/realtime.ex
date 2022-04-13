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
  Core.PubSub.IncidentDeleted,
  Core.PubSub.IncidentMessageCreated,
  Core.PubSub.IncidentMessageUpdated,
  Core.PubSub.IncidentMessageDeleted,
  Core.PubSub.NotificationCreated,
  Core.PubSub.UpgradeCreated,
  Core.PubSub.UpgradeQueueUpdated,
  Core.PubSub.UpgradeQueueCreated,
  Core.PubSub.RolloutCreated,
  Core.PubSub.RolloutUpdated,
  Core.PubSub.TestCreated,
  Core.PubSub.TestUpdated,
  Core.PubSub.StepLogs,
] do
  def publish?(_), do: true
end
