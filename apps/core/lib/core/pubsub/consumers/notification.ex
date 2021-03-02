defmodule Core.PubSub.Consumers.Notification do
  @moduledoc nil
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10
  alias Core.PubSub.{Notifiable, NotificationCreated}
  alias Core.Schema.Notification

  def handle_event(event) do
    with [_ | _] = entries <- Notifiable.notify(event) do
      {_, notifs} = Core.Repo.insert_all(Notification, entries, returning: true)

      Enum.map(notifs, &notify/1)
    end
  end

  defp notify(%Notification{} = notif) do
    Core.PubSub.Broadcaster.notify(%NotificationCreated{item: notif})
    notif
  end
end
