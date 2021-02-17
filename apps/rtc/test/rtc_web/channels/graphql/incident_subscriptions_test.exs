defmodule RtcWeb.Channels.IncidentSubscriptionTest do
  use RtcWeb.ChannelCase, async: true
  alias Core.PubSub

  describe "incidentDelta" do
    test "an installer can view incident deltas" do
      user = insert(:user)
      repo = insert(:repository)
      insert(:installation, user: user, repository: repo)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription IncidentDelta($id: ID!) {
          incidentDelta(repositoryId: $id) {
            delta
            payload {
              id
              title
            }
          }
        }
      """, variables: %{"id" => repo.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      incident = insert(:incident, repository: repo)

      publish_event(%PubSub.IncidentCreated{item: incident})
      assert_push("subscription:data", %{result: %{data: %{"incidentDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"] == incident.id
      assert doc["payload"]["title"] == incident.title

      publish_event(%PubSub.IncidentUpdated{item: incident})
      assert_push("subscription:data", %{result: %{data: %{"incidentDelta" => doc}}})
      assert doc["delta"] == "UPDATE"
      assert doc["payload"]["id"] == incident.id
      assert doc["payload"]["title"] == incident.title
    end
  end

  describe "incidentMessageDelta" do
    test "an incident creator can view incident messages" do
      incident = insert(:incident)
      {:ok, socket} = establish_socket(incident.creator)

      ref = push_doc(socket, """
        subscription MessageDelta($id: ID!) {
          incidentMessageDelta(incidentId: $id) {
            delta
            payload {
              id
              text
            }
          }
        }
      """, variables: %{"id" => incident.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      msg = insert(:incident_message, incident: incident)

      publish_event(%PubSub.IncidentMessageCreated{item: msg})
      assert_push("subscription:data", %{result: %{data: %{"incidentMessageDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"] == msg.id
      assert doc["payload"]["text"] == msg.text

      publish_event(%PubSub.IncidentMessageUpdated{item: msg})
      assert_push("subscription:data", %{result: %{data: %{"incidentMessageDelta" => doc}}})
      assert doc["delta"] == "UPDATE"
      assert doc["payload"]["id"] == msg.id
      assert doc["payload"]["text"] == msg.text

      publish_event(%PubSub.IncidentMessageDeleted{item: msg})
      assert_push("subscription:data", %{result: %{data: %{"incidentMessageDelta" => doc}}})
      assert doc["delta"] == "DELETE"
      assert doc["payload"]["id"] == msg.id
      assert doc["payload"]["text"] == msg.text
    end
  end
end
