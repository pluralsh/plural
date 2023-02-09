defmodule Core.PubSub.Consumers.Posthog do
  @moduledoc """
  Sends tracking events to our posthog
  """
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  alias Core.PubSub.Hoggable

  def handle_event(event) do
    with {event, id, attributes} <- Hoggable.hog(event) do
      Posthog.capture(event, Map.put(attributes, :distinct_id, id))
    end
  end
end
