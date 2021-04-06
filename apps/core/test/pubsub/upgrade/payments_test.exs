defmodule Core.PubSub.Upgrade.PaymentsTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub.Consumers.Upgrade
  alias Core.PubSub

  describe "SubscriptionUpdated" do
    test "It will post to the users upgrade q" do
      user  = insert(:user)
      queue = insert(:upgrade_queue, user: user)
      inst  = insert(:installation, user: user)
      subscription = insert(:subscription, installation: inst)

      event = %PubSub.SubscriptionUpdated{item: subscription}
      [{:ok, upgrade}] = Upgrade.handle_event(event)

      assert upgrade.repository_id == inst.repository_id
      assert upgrade.queue_id == queue.id
      assert upgrade.message == "updated repository subscription"
    end
  end

  describe "SubscriptionCreated" do
    test "It will post to the users upgrade q" do
      user  = insert(:user)
      queue = insert(:upgrade_queue, user: user)
      inst  = insert(:installation, user: user)
      subscription = insert(:subscription, installation: inst)

      event = %PubSub.SubscriptionCreated{item: subscription}
      [{:ok, upgrade}] = Upgrade.handle_event(event)

      assert upgrade.repository_id == inst.repository_id
      assert upgrade.queue_id == queue.id
      assert upgrade.message == "created repository subscription"
    end
  end
end
