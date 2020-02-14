defmodule Watchman.Cron do
  use Quantum.Scheduler,
    otp_app: :watchman
end