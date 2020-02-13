use Mix.Config

config :core, Core.Repo,
  username: "postgres",
  password: "postgres",
  database: "chartmart_dev",
  hostname: "localhost",
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :watchman, :initialize, true

config :watchman, Watchman.Repo,
  username: "postgres",
  password: "postgres",
  database: "chartmart_dev",
  hostname: "localhost",
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :api, ApiWeb.Endpoint,
  http: [port: 4000],
  debug_errors: true,
  code_reloader: true,
  check_origin: false

config :api, ApiWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/gettext/.*(po)$",
      ~r"lib/api_web/{live,views}/.*(ex)$",
      ~r"lib/api_web/templates/.*(eex)$"
    ]
  ]

config :watchman, WatchmanWeb.Endpoint,
  http: [port: 4003],
  debug_errors: true,
  code_reloader: true,
  check_origin: false
  # watchers: [
  #   node: [
  #     "node_modules/react-scripts/bin/react-scripts.js",
  #     "start",
  #     cd: Path.expand("../apps/watchman/assets", __DIR__)
  #   ]
  # ]

secrets_path = Path.expand("../secrets", __DIR__)

config :watchman,
  workspace_root: secrets_path,
  git_url: "git@github.com:michaeljguarino/chartmart-installations.git",
  repo_root: "chartmart-installations",
  chartmart_config: "/Users/michaelguarino/.chartmart",
  webhook_secret: "webhook_secret",
  git_ssh_key: :pass

config :watchman, WatchmanWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/gettext/.*(po)$",
      ~r"lib/api_web/{live,views}/.*(ex)$",
      ~r"lib/api_web/templates/.*(eex)$"
    ]
  ]

config :logger, :console, format: "[$level] $message\n"

config :phoenix, :stacktrace_depth, 20

config :phoenix, :plug_init_mode, :runtime

pem = Path.dirname(__ENV__.file) |> Path.join("testkey.pem") |> File.read!()
config :joken,
  chartmuseum: [
    signer_alg: "RS256",
    key_pem: pem
  ]