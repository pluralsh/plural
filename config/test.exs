use Mix.Config

config :core, Core.Repo,
  username: "postgres",
  password: "postgres",
  database: "chartmart_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

config :api, ApiWeb.Endpoint,
  http: [port: 4002],
  server: false

config :logger, level: :warn
