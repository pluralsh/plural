use Mix.Config

config :piazza_core,
  shutdown_delay: 14_000

config :api, ApiWeb.Endpoint,
  http: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :rtc, RtcWeb.Endpoint,
  url: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :logger, level: :info

config :goth, json: {:system, "GCP_CREDENTIALS"}

config :core, :consumers, [
  Core.PubSub.Consumers.Fanout,
  Core.PubSub.Consumers.Webhook
]

config :core, Core.Email.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: {:system, "SENGRID_API_KEY"}
