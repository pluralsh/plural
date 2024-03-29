defmodule Core.PubSub.Consumers.IntegrationWebhook do
  @moduledoc nil
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  import Core.Services.Base, only: [timestamped: 1]
  alias Core.PubSub.Deliverable
  alias Core.Schema.WebhookLog

  def handle_event(event) do
    with [_ | _] = webhooks <- Deliverable.hooks(event) do
      action  = Deliverable.action(event)
      payload = %{action: action, payload: Deliverable.payload(event)}

      logs = Enum.map(webhooks, &timestamped(%{
        webhook_id: &1.id, status: 0, attempts: 0, state: :sending, payload: payload
      }))

      {_, logs} = Core.Repo.insert_all(WebhookLog, logs, returning: true)

      Enum.zip(webhooks, logs)
      |> Enum.map(fn {webhook, log} ->
        body = {webhook, log}
        Core.Conduit.Broker.publish(%Conduit.Message{body: body}, :webhook)
        body
      end)
    end
  end
end
