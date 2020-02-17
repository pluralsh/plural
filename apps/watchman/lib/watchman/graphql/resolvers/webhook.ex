defmodule Watchman.GraphQl.Resolvers.Webhook do
  use Watchman.GraphQl.Resolvers.Base, model: Watchman.Schema.Webhook
  alias Watchman.Services.Webhooks

  def list_webhooks(args, _) do
    Webhook
    |> Webhook.ordered(asc: :url)
    |> paginate(args)
  end

  def create_webhook(%{attributes: attrs}, _),
    do: Webhooks.create(attrs)
end