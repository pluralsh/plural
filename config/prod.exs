use Mix.Config

config :api, ApiWeb.Endpoint,
  http: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :watchman, WatchmanWeb.Endpoint,
  http: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :logger, level: :info

config :goth, json: {:system, "GCP_CREDENTIALS"}

config :core, :consumers, [
  Core.PubSub.Consumers.Fanout
]

config :core, Core.Email.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: {:system, "SENGRID_API_KEY"}