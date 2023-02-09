defmodule Core.PubSub.Posthog.RepositoriesTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub.Consumers
  alias Core.PubSub

  describe "InstallationCreated" do
    test "it will send a installation.created event" do
      inst = insert(:installation)
      expect(Posthog, :capture, fn "installation.created", attrs -> {:ok, attrs} end)

      event = %PubSub.InstallationCreated{item: inst}
      {:ok, attrs} = Consumers.Posthog.handle_event(event)

      assert attrs.applicationID == inst.repository_id
      assert attrs.distinct_id == inst.user_id
      assert attrs.applicationName == inst.repository.name
    end
  end

  describe "InstallationDeleted" do
    test "it will send a installation.deleted event" do
      inst = insert(:installation)
      expect(Posthog, :capture, fn "installation.deleted", attrs -> {:ok, attrs} end)

      event = %PubSub.InstallationDeleted{item: inst}
      {:ok, attrs} = Consumers.Posthog.handle_event(event)

      assert attrs.applicationID == inst.repository_id
      assert attrs.distinct_id == inst.user_id
      assert attrs.applicationName == inst.repository.name
    end
  end
end
