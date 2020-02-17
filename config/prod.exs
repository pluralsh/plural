use Mix.Config

config :piazza_core,
  shutdown_delay: 14_000

config :api, ApiWeb.Endpoint,
  http: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :watchman, :initialize, true

config :watchman, WatchmanWeb.Endpoint,
  http: [port: 4000],
  # force_ssl: [hsts: true, rewrite_on: [:x_forwarded_proto]],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :logger, level: :info

config :goth, json: {:system, "GCP_CREDENTIALS"}

config :core, :consumers, [
  Core.PubSub.Consumers.Fanout
]

config :watchman, :consumers, [
  Watchman.PubSub.Consumers.Webhook
]

config :core, Core.Email.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: {:system, "SENGRID_API_KEY"}

config :watchman, Watchman.Cron,
  jobs: [
    {"@daily", {Watchman.Cron.Jobs, :prune_builds, []}}
  ]