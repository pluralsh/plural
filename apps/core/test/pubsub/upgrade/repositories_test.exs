defmodule Core.PubSub.Upgrade.RepositoriesTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub.Consumers.Upgrade
  alias Core.PubSub

  describe "InstallationUpdated" do
    test "It will send an upgrade for a user" do
      user  = insert(:user)
      queue = insert(:upgrade_queue, user: user)
      inst  = insert(:installation, user: user)

      event = %PubSub.InstallationUpdated{item: inst}
      [{:ok, upgrade}] = Upgrade.handle_event(event)

      assert upgrade.repository_id == inst.repository_id
      assert upgrade.queue_id == queue.id
      assert upgrade.message == "updated repository configuration"
    end
  end
end
