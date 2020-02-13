defmodule Watchman.Repo do
  use Ecto.Repo,
    otp_app: :watchman,
    adapter: Ecto.Adapters.Postgres

  use Bourne
end