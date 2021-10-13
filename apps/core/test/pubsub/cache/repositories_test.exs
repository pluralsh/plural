defmodule Core.PubSub.Consumers.Cache.RepositoriesTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.PubSub.Consumers.Cache

  describe "InstallationCreated" do
    test "it will wipe a has_installations record" do
      %{user: user} = inst = insert(:installation)

      Core.Cache.put({:has_installations, user.id}, true)
      event = %PubSub.InstallationCreated{item: inst}
      Cache.handle_event(event)

      refute Core.Cache.get({:has_installations, user.id})
    end
  end

  describe "InstallationDeleted" do
    test "it will wipe a has_installations record" do
      %{user: user} = inst = insert(:installation)

      Core.Cache.put({:has_installations, user.id}, true)
      event = %PubSub.InstallationDeleted{item: inst}
      Cache.handle_event(event)

      refute Core.Cache.get({:has_installations, user.id})
    end
  end
end
