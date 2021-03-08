defmodule Rtc.Presence do
  use Phoenix.Presence,
    otp_app: :rtc,
    pubsub_server: Rtc.PubSub
end
