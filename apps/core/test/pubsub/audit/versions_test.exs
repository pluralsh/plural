defmodule Core.PubSub.Audits.VersionsTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.PubSub.Consumers.Audits

  describe "VersionCreated" do
    test "it can post a message about the meeting" do
      version = insert(:version)
      actor   = insert(:user)

      event = %PubSub.VersionCreated{item: version, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "version:created"
      assert audit.version_id == version.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
      assert audit.repository_id == version.chart.repository_id
    end
  end

  describe "VersionUpdated" do
    test "it can post a message about the meeting" do
      version = insert(:version)
      actor   = insert(:user)

      event = %PubSub.VersionUpdated{item: version, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "version:updated"
      assert audit.version_id == version.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
      assert audit.repository_id == version.chart.repository_id
    end
  end
end
