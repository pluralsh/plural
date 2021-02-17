defmodule Rtc.Conduit.Subscriber do
  use Conduit.Subscriber
  import Conduit.Message

  def process(message, _opts) do
    case publish_event(message.body) do
      :ok -> ack(message)
      _ -> nack(message)
    end
  end

  def publish_event(event) do
    with {object, topics} <- Rtc.Channels.Negotiator.negotiate(event),
      do: Absinthe.Subscription.publish(RtcWeb.Endpoint, object, topics)
  end
end
