use Mix.Config

config :core, Core.Repo,
  username: "postgres",
  password: "postgres",
  database: "forge_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

config :api, ApiWeb.Endpoint,
  http: [port: 4002],
  server: false

config :rtc, RtcWeb.Endpoint,
  http: [port: 4002],
  server: false

config :logger, level: :warn

path = __ENV__.file |> Path.dirname()

config :core, :jwt,
  pk: Path.join(path, "testkey.pem") |> File.read!(),
  cert: Path.join(path, "testcert.crt") |> File.read!(),
  iss: "forge.piazza.app",
  aud: "forge.piazza.app"

config :goth,
  json: System.get_env("GOOGLE_APPLICATION_CREDENTIALS") |> File.read!()

config :piazza_core, aes_key: "1HdFP1DuK7xkkcEBne41yAwUY8NSfJnYfGVylYYCS2U="

config :core, :consumers, [Core.EchoConsumer]

config :core, Core.Email.Mailer,
  adapter: Bamboo.TestAdapter
