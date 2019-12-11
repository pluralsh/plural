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

config :watchman, WatchmanWeb.Endpoint,
  http: [port: 4002],
  server: false

config :logger, level: :warn

path = __ENV__.file |> Path.dirname()

config :core, :jwt,
  pk: Path.join(path, "testkey.pem") |> File.read!(),
  cert: Path.join(path, "testcert.crt") |> File.read!(),
  iss: "mart.piazzaapp.com",
  aud: "mart.piazzaapp.com"

config :goth,
  json: System.get_env("GOOGLE_APPLICATION_CREDENTIALS") |> File.read!()

config :piazza_core, aes_key: "1HdFP1DuK7xkkcEBne41yAwUY8NSfJnYfGVylYYCS2U="

config :watchman,
  workspace_root: path |> Path.dirname() |> Path.join("secrets"),
  git_url: "git@github.com:michaeljguarino/chartmart-installations.git",
  repo_root: "chartmart-installations",
  chartmart_config: "/Users/michaelguarino/.chartmart"
