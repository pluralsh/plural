defmodule Core.Conduit.WebhookSubscriber do
  use Conduit.Subscriber
  import Conduit.Message
  alias Core.Schema.WebhookLog

  def process(%{body: {webhook, log, message}} = message, _opts) do
    publish_event(webhook, log, message)

    ack(message)
  end

  def publish_event(webhook, log, message) do
    case Core.Services.Accounts.post_webhook(message, webhook) do
      {:ok, %{status_code: code, body: body}} ->
        update_log(log, %{response: body, status: code, state: :delivered})
      _ -> maybe_redeliver(webhook, log, message)
    end
  end

  defp maybe_redeliver(webhook, %WebhookLog{attempts: attempts} = log, message) when attempts < 2 do
    {:ok, log} = update_log(log, %{attempts: attempts + 1})
    Core.Conduit.Broker.publish(%Conduit.Message{body: {webhook, log, message}}, :webhook)
  end

  defp maybe_redeliver(_, log, _), do: update_log(log, %{state: :failed, attempts: log.attempts + 1})

  defp update_log(log, attrs) do
    log
    |> WebhookLog.changeset(attrs)
    |> Core.Repo.update()
  end
end
