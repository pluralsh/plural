defmodule Core.PubSub.Fanout.AccountsTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub

  describe "ZoomMeetingCreated" do
    test "it can post a message about the meeting" do
      incident = insert(:incident)

      event = %PubSub.ZoomMeetingCreated{
        item: %{join_url: "join-url", incident_id: incident.id, password: "pwd"},
        actor: incident.creator
      }

      {:ok, msg} = PubSub.Fanout.fanout(event)

      assert msg.text == "I just created a zoom meeting here: join-url (password is pwd)"
    end
  end
end
