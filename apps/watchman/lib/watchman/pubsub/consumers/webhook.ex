defmodule Watchman.PubSub.Consumers.Webhook do
  use Piazza.PubSub.Consumer,
    broadcaster: Watchman.PubSub.Broadcaster,
    max_demand: 10
  require Logger
  alias Watchman.Services.Webhooks

  def handle_event(event) do
    with {:ok, {build, webhook_query}} <- Watchman.PubSub.Webhook.deliver(event) do
      Logger.info "Delivering webhooks"

      webhook_query
      |> Watchman.Repo.stream(method: :keyset)
      |> Flow.from_enumerable()
      |> Flow.map(&Webhooks.deliver(build, &1))
      |> Flow.map(fn
        {:ok, wh} -> wh
        {:error, error} ->
          Logger.error "Failed to deliver webhook properly: #{inspect(error)}"
          nil
      end)
      |> Flow.run()
    end
  end
end