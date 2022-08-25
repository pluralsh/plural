defmodule Core.Conduit.Base do
  defmacro __using__(opts) do
    quote do
      use Conduit.Broker, unquote(opts)
      import Core.Conduit.Base

      configure do
        exchange "plural.topic", type: :topic, durable: true

        defqueue "plural.rtc"
        defqueue "plural.webhook"
        defqueue "plural.dkr"
        defqueue "plural.upgrade"
        defqueue "plural.scan"
        defqueue "plural.cluster"
      end

      pipeline :out_tracking do
        plug Conduit.Plug.CorrelationId
        plug Conduit.Plug.CreatedBy, app: "plural"
        plug Conduit.Plug.CreatedAt
        plug Conduit.Plug.LogOutgoing
        plug Conduit.Plug.Format, content_type: "application/x-erlang-binary"
      end

      pipeline :error_destination do
        plug :put_destination, & "zzz.#{&1.source}"
      end

      outgoing do
        pipe_through [:out_tracking]

        publish :rtc, exchange: "plural.topic", to: "plural.rtc"
        publish :webhook, exchange: "plural.topic", to: "plural.webhook"
        publish :dkr, exchange: "plural.topic", to: "plural.dkr"
        publish :upgrade, exchange: "plural.topic", to: "plural.upgrade"
        publish :scan, exchange: "plural.topic", to: "plural.scan"
        publish :cluster, exchange: "plural.topic", to: "plural.cluster"
      end

      outgoing do
        pipe_through [:error_destination, :out_tracking]

        publish :error, exchange: "plural.topic", to: "plural.error"
      end
    end
  end

  defmacro defqueue(name) do
    deadletter = "zzz.#{name}"

    quote do
      queue unquote(name), from: [unquote(name)], exchange: "plural.topic", durable: true
      queue unquote(deadletter), from: [unquote(deadletter)], exchange: "plural.topic", durable: true
    end
  end
end
