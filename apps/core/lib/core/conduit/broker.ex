defmodule Core.Conduit.Broker do
  use Core.Conduit.Base, otp_app: :core

  configure do
    exchange "forge.topic", type: :topic, durable: true

    defqueue "forge.rtc"
  end
end
