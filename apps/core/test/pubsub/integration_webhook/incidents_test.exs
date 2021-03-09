defmodule Core.PubSub.IntegrationWebhook.IncidentsTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub
  alias Core.PubSub.Consumers.IntegrationWebhook

  describe "IncidentCreated" do
    test "it will deliver webhooks" do
      account  = insert(:account)
      incident = insert(:incident, creator: build(:user, account: account))
      webhooks = insert_list(2, :integration_webhook, account: account)
      expect(Core.Conduit.Broker, :publish, 2, fn _, _ -> :ok end)

      event = %PubSub.IncidentCreated{item: incident}
      results = IntegrationWebhook.handle_event(event)

      assert Enum.map(results, &elem(&1, 0))
             |> ids_equal(webhooks)

      for {webhook, %{payload: %{action: "incident.created", payload: payload}} = log} <- results do
        assert webhook.id == log.webhook_id
        assert log.state == :sending
        assert log.attempts == 0
        assert payload.id == incident.id
      end
    end
  end

  describe "IncidentUpdated" do
    test "it will deliver webhooks" do
      account  = insert(:account)
      incident = insert(:incident, creator: build(:user, account: account))
      webhooks = insert_list(2, :integration_webhook, account: account)
      expect(Core.Conduit.Broker, :publish, 2, fn _, _ -> :ok end)

      event = %PubSub.IncidentCreated{item: incident}
      results = IntegrationWebhook.handle_event(event)

      assert Enum.map(results, &elem(&1, 0))
             |> ids_equal(webhooks)

      for {webhook, %{payload: %{action: "incident.upated", payload: payload}} = log} <- results do
        assert webhook.id == log.webhook_id
        assert log.state == :sending
        assert log.attempts == 0
        assert payload.id == incident.id
      end
    end
  end

  describe "IncidentMessageCreated" do
    test "it will deliver webhooks" do
      account  = insert(:account)
      incident = insert(:incident, creator: build(:user, account: account))
      msg      = insert(:incident_message, incident: incident)
      webhooks = insert_list(2, :integration_webhook, account: account)
      expect(Core.Conduit.Broker, :publish, 2, fn _, _ -> :ok end)

      event = %PubSub.IncidentMessageCreated{item: msg}
      results = IntegrationWebhook.handle_event(event)

      assert Enum.map(results, &elem(&1, 0))
             |> ids_equal(webhooks)

      for {webhook, %{payload: %{action: "incident.message.created", payload: payload}} = log} <- results do
        assert webhook.id == log.webhook_id
        assert log.state == :sending
        assert log.attempts == 0
        assert payload.id == msg.id
      end
    end
  end

  describe "IncidentMessageUpdated" do
    test "it will deliver webhooks" do
      account  = insert(:account)
      incident = insert(:incident, creator: build(:user, account: account))
      msg      = insert(:incident_message, incident: incident)
      webhooks = insert_list(2, :integration_webhook, account: account)
      expect(Core.Conduit.Broker, :publish, 2, fn _, _ -> :ok end)

      event = %PubSub.IncidentMessageUpdated{item: msg}
      results = IntegrationWebhook.handle_event(event)

      assert Enum.map(results, &elem(&1, 0))
             |> ids_equal(webhooks)

      for {webhook, %{payload: %{action: "incident.message.updated", payload: payload}} = log} <- results do
        assert webhook.id == log.webhook_id
        assert log.state == :sending
        assert log.attempts == 0
        assert payload.id == msg.id
      end
    end
  end

  describe "IncidentMessageDeleted" do
    test "it will deliver webhooks" do
      account  = insert(:account)
      incident = insert(:incident, creator: build(:user, account: account))
      msg      = insert(:incident_message, incident: incident)
      webhooks = insert_list(2, :integration_webhook, account: account)
      expect(Core.Conduit.Broker, :publish, 2, fn _, _ -> :ok end)

      event = %PubSub.IncidentMessageDeleted{item: msg}
      results = IntegrationWebhook.handle_event(event)

      assert Enum.map(results, &elem(&1, 0))
             |> ids_equal(webhooks)

      for {webhook, %{payload: %{action: "incident.message.deleted", payload: payload}} = log} <- results do
        assert webhook.id == log.webhook_id
        assert log.state == :sending
        assert log.attempts == 0
        assert payload.id == msg.id
      end
    end
  end
end
