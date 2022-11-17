import Config

config :core, Core.Repo,
  username: "postgres",
  password: "postgres",
  database: "forge_dev",
  hostname: "localhost",
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :core, Core.Email.Mailer,
  adapter: Bamboo.LocalAdapter

config :goth,
  disabled: true

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

config :rtc, RtcWeb.Endpoint,
  http: [port: 4001],
  debug_errors: true,
  code_reloader: true,
  check_origin: false

config :rtc, RtcWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/gettext/.*(po)$",
      ~r"lib/rtc_web/(live|views)/.*(ex)$",
      ~r"lib/rtc_web/templates/.*(eex)$"
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

config :email, EmailWeb.Endpoint,
  http: [port: 4002],
  debug_errors: true,
  code_reloader: true,
  check_origin: false

config :core, :consumers, [
  Core.PubSub.Consumers.Fanout,
  Core.PubSub.Consumers.Upgrade,
  Core.PubSub.Consumers.Rtc,
  Core.PubSub.Consumers.Notification,
  Core.PubSub.Consumers.IntegrationWebhook,
  Core.PubSub.Consumers.Audits,
  Core.PubSub.Consumers.Cache
]

config :email, :consumers, [
  Email.PubSub.Consumer
]

# # Watch static and templates for browser reloading.
# config :email, EmailWeb.Endpoint,
#   live_reload: [
#     patterns: [
#       ~r"priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$",
#       ~r"priv/gettext/.*(po)$",
#       ~r"lib/email_web/(live|views)/.*(ex)$",
#       ~r"lib/email_web/templates/.*(eex)$"
#     ]
#   ]
