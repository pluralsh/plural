defmodule Core.PubSub.Upgrade.RepositoriesTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.PubSub.Consumers.Upgrade

  describe "OIDCProviderCreated" do
    test "It will post to the users upgrade q" do
      user  = insert(:user)
      queue = insert(:upgrade_queue, user: user)
      inst  = insert(:installation, user: user)
      oidc = insert(:oidc_provider, installation: inst)

      event = %PubSub.OIDCProviderCreated{item: oidc}
      [{:ok, upgrade}] = Upgrade.handle_event(event)

      assert upgrade.repository_id == inst.repository_id
      assert upgrade.queue_id == queue.id
      assert upgrade.message == "created oidc provider"
    end
  end

  describe "OIDCProviderUpdated" do
    test "It will post to the users upgrade q" do
      user  = insert(:user)
      queue = insert(:upgrade_queue, user: user)
      inst  = insert(:installation, user: user)
      oidc = insert(:oidc_provider, installation: inst)

      event = %PubSub.OIDCProviderUpdated{item: oidc}
      [{:ok, upgrade}] = Upgrade.handle_event(event)

      assert upgrade.repository_id == inst.repository_id
      assert upgrade.queue_id == queue.id
      assert upgrade.message == "updated oidc provider"
    end
  end
end
