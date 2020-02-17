defmodule Core.PubSub.Consumers.Webhook do
  @moduledoc """
  Single destination webhook publisher

  For cases where a list of webhooks need to be derived, use Fanout
  """
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  alias Core.PubSub.Webhook
  alias Core.Services.Users

  def handle_event(event) do
    with {message, [_ | _] = webhook} <- Webhook.derive(event) do
      Enum.map(webhook, &Users.post_webhook(message, &1))
    end
  end
end