defmodule Core.Conduit.WebhookSubscriberTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.Conduit.WebhookSubscriber

  describe "#publish_event/3" do
    test "it can post to a webhook and update the logs" do
      %{url: url} = webhook = insert(:integration_webhook)
      payload = %{action: "incident.created", payload: %{example: "payload"}}
      log     = insert(:webhook_log, webhook: webhook, payload: payload)
      expect(HTTPoison, :post, fn ^url, body, _ ->
        send self(), {:body, Jason.decode!(body)}
        {:ok, %HTTPoison.Response{status_code: 200, body: "OK"}}
      end)

      WebhookSubscriber.publish_event(webhook, log)

      log = refetch(log)
      assert log.status == 200
      assert log.state == :delivered
      assert log.response == "OK"

      assert_receive {:body, %{"action" => "incident.created", "payload" => %{"example" => "payload"}}}
    end

    test "it can increment attempts if failed" do
      %{url: url} = webhook = insert(:integration_webhook)
      payload = %{action: "incident.created", payload: %{example: "payload"}}
      log = insert(:webhook_log, webhook: webhook, payload: payload)
      expect(HTTPoison, :post, fn ^url, _, _ -> {:error, :ignore} end)
      expect(Core.Conduit.Broker, :publish, fn %{body: {_, log}}, _ -> {:ok, log} end)

      {:ok, log} = WebhookSubscriber.publish_event(webhook, log)

      assert log.state == :sending
      assert log.attempts == 1
    end

    test "it will fail outright if attempts are exhausted" do
      %{url: url} = webhook = insert(:integration_webhook)
      payload = %{action: "incident.created", payload: %{example: "payload"}}
      log     = insert(:webhook_log, webhook: webhook, attempts: 2, payload: payload)
      expect(HTTPoison, :post, fn ^url, _, _ -> {:error, :ignore} end)
      reject(&Core.Conduit.Broker.publish/2)

      WebhookSubscriber.publish_event(webhook, log)

      log = refetch(log)
      assert log.state == :failed
      assert log.attempts == 3
    end
  end
end
