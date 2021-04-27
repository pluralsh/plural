defmodule Core.PubSub.Consumers.Rtc do
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 20

  def handle_event(event) do
    if Core.PubSub.Realtime.publish?(event) do
      Core.broker().publish(%Conduit.Message{body: event}, :rtc)
    end
  end
end
