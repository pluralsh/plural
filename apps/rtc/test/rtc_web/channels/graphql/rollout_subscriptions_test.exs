defmodule RtcWeb.Channels.RolloutSubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "incidentDelta" do
    test "an installer can view incident deltas" do
      user = insert(:user)
      repo = insert(:repository)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription RolloutDelta($id: ID!) {
          rolloutDelta(repositoryId: $id) {
            delta
            payload { id }
          }
        }
      """, variables: %{"id" => repo.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      rollout = insert(:rollout, repository: repo)

      publish_event(%PubSub.RolloutCreated{item: rollout})
      assert_push("subscription:data", %{result: %{data: %{"rolloutDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"] == rollout.id

      publish_event(%PubSub.RolloutUpdated{item: rollout})
      assert_push("subscription:data", %{result: %{data: %{"rolloutDelta" => doc}}})
      assert doc["delta"] == "UPDATE"
      assert doc["payload"]["id"] == rollout.id
    end
  end
end
