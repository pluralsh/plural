defmodule Core.Conduit.Base do
  defmacro __using__(opts) do
    quote do
      use Conduit.Broker, unquote(opts)
      import Core.Conduit.Base

      configure do
        exchange "forge.topic", type: :topic, durable: true

        defqueue "forge.rtc"
        defqueue "forge.webhook"
        defqueue "forge.dkr"
      end

      pipeline :out_tracking do
        plug Conduit.Plug.CorrelationId
        plug Conduit.Plug.CreatedBy, app: "forge"
        plug Conduit.Plug.CreatedAt
        plug Conduit.Plug.LogOutgoing
        plug Conduit.Plug.Format, content_type: "application/x-erlang-binary"
      end

      pipeline :error_destination do
        plug :put_destination, & "zzz.#{&1.source}"
      end

      outgoing do
        pipe_through [:out_tracking]

        publish :rtc, exchange: "forge.topic", to: "forge.rtc"
        publish :webhook, exchange: "forge.topic", to: "forge.webhook"
        publish :dkr, exchange: "forge.topic", to: "forge.dkr"
      end

      outgoing do
        pipe_through [:error_destination, :out_tracking]

        publish :error, exchange: "forge.topic", to: "forge.error"
      end
    end
  end

  defmacro defqueue(name) do
    deadletter = "zzz.#{name}"

    quote do
      queue unquote(name), from: [unquote(name)], exchange: "forge.topic", durable: true
      queue unquote(deadletter), from: [unquote(deadletter)], exchange: "forge.topic", durable: true
    end
  end
end
