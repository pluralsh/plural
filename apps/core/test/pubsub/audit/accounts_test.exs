defmodule Core.PubSub.Audits.AccountsTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.PubSub.Consumers.Audits

  describe "GroupCreated" do
    test "it can post a message about the meeting" do
      group = insert(:group)
      actor = insert(:user)

      event = %PubSub.GroupCreated{item: group, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "group:created"
      assert audit.group_id == group.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "GroupUpdated" do
    test "it can post a message about the meeting" do
      group = insert(:group)
      actor = insert(:user)

      event = %PubSub.GroupUpdated{item: group, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "group:updated"
      assert audit.group_id == group.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "GroupDeleted" do
    test "it can post a message about the meeting" do
      group = insert(:group)
      actor = insert(:user)

      event = %PubSub.GroupDeleted{item: group, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "group:deleted"
      assert audit.group_id == group.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "RoleCreated" do
    test "it can post a message about the meeting" do
      role = insert(:role)
      actor = insert(:user)

      event = %PubSub.RoleCreated{item: role, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "role:created"
      assert audit.role_id == role.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "RoleUpdated" do
    test "it can post a message about the meeting" do
      role = insert(:role)
      actor = insert(:user)

      event = %PubSub.RoleUpdated{item: role, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "role:updated"
      assert audit.role_id == role.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "RoleDeleted" do
    test "it can post a message about the meeting" do
      role = insert(:role)
      actor = insert(:user)

      event = %PubSub.RoleDeleted{item: role, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "role:deleted"
      assert audit.role_id == role.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "IntegrationWebhookCreated" do
    test "it can post a message about the meeting" do
      webhook = insert(:integration_webhook)
      actor   = insert(:user)

      event = %PubSub.IntegrationWebhookCreated{item: webhook, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "webhook:created"
      assert audit.integration_webhook_id == webhook.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "IntegrationWebhookUpdated" do
    test "it can post a message about the meeting" do
      webhook = insert(:integration_webhook)
      actor   = insert(:user)

      event = %PubSub.IntegrationWebhookUpdated{item: webhook, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "webhook:updated"
      assert audit.integration_webhook_id == webhook.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "IntegrationWebhookDeleted" do
    test "it can post a message about the meeting" do
      webhook = insert(:integration_webhook)
      actor   = insert(:user)

      event = %PubSub.IntegrationWebhookDeleted{item: webhook, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "webhook:deleted"
      assert audit.integration_webhook_id == webhook.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end
end
