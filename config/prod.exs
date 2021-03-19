use Mix.Config

config :piazza_core,
  shutdown_delay: 14_000

config :api, ApiWeb.Endpoint,
  http: [port: 4000, compress: true],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :rtc, RtcWeb.Endpoint,
  http: [port: 4000, compress: true],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :logger, level: :info

config :goth, json: {:system, "GCP_CREDENTIALS"}

config :core, :consumers, [
  Core.PubSub.Consumers.Fanout,
  Core.PubSub.Consumers.Webhook,
  Core.PubSub.Consumers.Rtc,
  Core.PubSub.Consumers.Notification,
  Core.PubSub.Consumers.IntegrationWebhook,
]

config :core, Core.Email.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: {:system, "SENGRID_API_KEY"}

config :worker, docker_env: [
  # {"DOCKER_HOST", "tcp://localhost:2376"},
  # {"DOCKER_CERT_PATH", "/certs/client"},
  # {"DOCKER_TLS_VERIFY", "1"},
]
