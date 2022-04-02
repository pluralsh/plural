defmodule RtcWeb.Channels.TestSubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "testDelta" do
    test "an user can view test deltas" do
      user = insert(:user)
      repo = insert(:repository)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription TestDelta($id: ID!) {
          testDelta(repositoryId: $id) {
            delta
            payload { id }
          }
        }
      """, variables: %{"id" => repo.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      test = insert(:test, repository: repo)
      publish_event(%PubSub.TestCreated{item: test})
      assert_push("subscription:data", %{result: %{data: %{"testDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"] == test.id

      publish_event(%PubSub.TestUpdated{item: test})
      assert_push("subscription:data", %{result: %{data: %{"testDelta" => doc}}})
      assert doc["delta"] == "UPDATE"
      assert doc["payload"]["id"] == test.id
    end
  end
end
