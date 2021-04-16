defmodule Core.Conduit.Broker do
  use Core.Conduit.Base, otp_app: :core

  pipeline :in_tracking do
    plug Conduit.Plug.CorrelationId
    plug Conduit.Plug.LogIncoming
  end

  pipeline :error_handling do
    plug Core.Conduit.Plug.DeadLetter, broker: __MODULE__, publish_to: :error
    plug Core.Conduit.Plug.Retry, attempts: 3
  end

  pipeline :deserialize do
    plug Conduit.Plug.Parse, content_type: "application/x-erlang-binary"
  end

  incoming Core.Conduit do
    pipe_through [:in_tracking, :error_handling, :deserialize]

    subscribe :message, WebhookSubscriber, from: "plural.webhook"
  end
end
