defmodule Core.PubSub.Usage.UpgradesTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.PubSub.Consumers.Usage

  describe "UpgradeQueueCreated" do
    test "it can post a message about the meeting" do
      q = insert(:upgrade_queue)

      event = %PubSub.UpgradeQueueCreated{item: q}
      {1, _} = Usage.handle_event(event)

      account = refetch(q.user.account)
      assert account.cluster_count == 1
      assert account.usage_updated
    end
  end
end
