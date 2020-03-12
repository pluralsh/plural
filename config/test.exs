use Mix.Config

config :core, Core.Repo,
  username: "postgres",
  password: "postgres",
  database: "forge_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

config :watchman, Watchman.Repo,
  username: "postgres",
  password: "postgres",
  database: "forge_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

config :api, ApiWeb.Endpoint,
  http: [port: 4002],
  server: false

config :watchman, WatchmanWeb.Endpoint,
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

secrets_path = path |> Path.dirname() |> Path.join("secrets")

config :watchman,
  workspace_root: secrets_path,
  git_url: "git@github.com:michaeljguarino/forge-installations.git",
  repo_root: "forge-installations",
  forge_config: "/Users/michaelguarino/.forge",
  webhook_secret: "webhook_secret",
  git_ssh_key: :pass,
  grafana_dns: "grafana.example.com"

config :watchman, :consumers, [Watchman.EchoConsumer]
config :core, :consumers, [Core.EchoConsumer]

config :core, Core.Email.Mailer,
  adapter: Bamboo.TestAdapter

config :kazan, :server, %{url: "kubernetes.default", auth: %{token: "your_token"}}
