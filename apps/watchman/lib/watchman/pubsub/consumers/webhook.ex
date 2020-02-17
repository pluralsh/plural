defmodule Watchman.PubSub.Consumers.Webhook do
  use Piazza.PubSub.Consumer,
    broadcaster: Watchman.PubSub.Broadcaster,
    max_demand: 10
  require Logger

  @headers [
    {"content-type", "application/json"},
    {"accept", "application/json"}
  ]

  def handle_event(event) do
    with wh when is_binary(wh) <- get_webhook(),
        {:ok, payload} <- Watchman.PubSub.Webhook.deliver(event) do
      Logger.info "Attempting to deliver webhook"
      Mojito.post(wh, @headers, Jason.encode!(payload))
    end
  end

  defp get_webhook() do
    case Watchman.conf(:incoming_webhook) do
      nil -> :ok
      webhook -> webhook
    end
  end
end