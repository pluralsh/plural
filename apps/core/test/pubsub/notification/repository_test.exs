defmodule Core.PubSub.Notification.RepositoryTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub.Consumers.Notification
  alias Core.PubSub

  describe "InstallationLocked" do
    test "it can lock an installation" do
      ci = insert(:chart_installation)

      event = %PubSub.InstallationLocked{item: ci}
      [notif] = Notification.handle_event(event)

      assert notif.type == :locked
      assert notif.user_id == ci.installation.user_id
      assert notif.repository_id == ci.installation.repository_id
      assert notif.actor_id == ci.installation.user_id
      assert is_binary(notif.msg)
    end
  end
end
