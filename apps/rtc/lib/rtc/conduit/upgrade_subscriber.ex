defmodule Rtc.Conduit.UpgradeSubscriber do
  use Conduit.Subscriber
  import Conduit.Message

  def process(message, _opts) do
    case publish_event(message.body) do
      :ok -> ack(message)
      _ -> nack(message)
    end
  end

  def publish_event(upgrade) do
    %{queue: q} = upgrade = Core.Repo.preload(upgrade, [:queue])
    Phoenix.Channel.Server.broadcast(Rtc.PubSub, "upgrades:#{q.user_id}", "new_upgrade", upgrade)
  end
end
