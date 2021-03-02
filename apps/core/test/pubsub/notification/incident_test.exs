defmodule Core.PubSub.Notification.IncidentTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub.Consumers.Notification
  alias Core.PubSub

  describe "IncidentUpdated" do
    test "it will notify all followers" do
      actor = insert(:user)
      incident = insert(:incident)
      followers = insert_list(3, :follower, incident: incident, preferences: %{incident_update: true})
      insert(:follower, incident: incident, preferences: %{incident_update: false})

      event = %PubSub.IncidentUpdated{item: incident, actor: actor}
      notifs = Notification.handle_event(event)

      assert Enum.map(followers, & &1.user_id)
             |> ids_equal(Enum.map(notifs, & &1.user_id))
      assert Enum.all?(notifs, & &1.actor_id == actor.id)
      assert Enum.all?(notifs, & &1.incident_id == incident.id)
      assert Enum.all?(notifs, & &1.type == :incident_update)

      for notif <- notifs,
        do: assert_receive {:event, %PubSub.NotificationCreated{item: ^notif}}
    end
  end

  describe "IncidentMessageCreated" do
    test "it will notify all followers" do
      incident  = insert(:incident)
      msg       = insert(:incident_message, incident: incident)
      followers = insert_list(3, :follower, incident: incident, preferences: %{message: true})
      insert(:follower, incident: incident, preferences: %{message: false})

      event = %PubSub.IncidentMessageCreated{item: msg}
      notifs = Notification.handle_event(event)

      assert Enum.map(followers, & &1.user_id)
             |> ids_equal(Enum.map(notifs, & &1.user_id))
      assert Enum.all?(notifs, & &1.actor_id    == msg.creator_id)
      assert Enum.all?(notifs, & &1.incident_id == incident.id)
      assert Enum.all?(notifs, & &1.message_id  == msg.id)
      assert Enum.all?(notifs, & &1.type        == :message)

      for notif <- notifs,
        do: assert_receive {:event, %PubSub.NotificationCreated{item: ^notif}}
    end
  end
end
