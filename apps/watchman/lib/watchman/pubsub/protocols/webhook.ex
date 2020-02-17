defprotocol Watchman.PubSub.Webhook do
  @moduledoc """
  Delivers build status events to the configured incoming webhook
  """
  @fallback_to_any true
  @spec deliver(struct) :: {:ok, map} | :ok
  def deliver(event)
end

defimpl Watchman.PubSub.Webhook, for: Any do
  def deliver(_), do: :ok
end

defimpl Watchman.PubSub.Webhook, for: [Watchman.PubSub.BuildSucceeded, Watchman.PubSub.BuildFailed] do
  alias Watchman.Schema.Webhook
  def deliver(%{item: build}),
    do: {:ok, {build, Webhook.ordered()}}
end