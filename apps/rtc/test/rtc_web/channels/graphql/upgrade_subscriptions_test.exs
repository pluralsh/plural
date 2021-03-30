defmodule RtcWeb.Channels.UpgradeSubscriptionsTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "upgrade" do
    test "an installer can view incident deltas" do
      user = insert(:user)
      q = insert(:upgrade_queue, user: user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription  {
          upgrade { id }
        }
      """, variables: %{})

      assert_reply(ref, :ok, %{subscriptionId: _})

      upgrade = insert(:upgrade, queue: q)
      publish_event(%PubSub.UpgradeCreated{item: upgrade})
      assert_push("subscription:data", %{result: %{data: %{"upgrade" => doc}}})
      assert doc["id"] == upgrade.id
    end
  end

  describe "upgradeQueueDelta" do
    test "an installer can view incident deltas" do
      user = insert(:user)
      q = insert(:upgrade_queue, user: user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription  {
          upgradeQueueDelta { delta payload { id } }
        }
      """, variables: %{})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.UpgradeQueueUpdated{item: q})
      assert_push("subscription:data", %{result: %{data: %{"upgradeQueueDelta" => doc}}})
      assert doc["delta"] == "UPDATE"
      assert doc["payload"]["id"] == q.id
    end
  end
end
