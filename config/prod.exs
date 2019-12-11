use Mix.Config

config :api, ApiWeb.Endpoint,
  http: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :api, WatchmanWeb.Endpoint,
  http: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :logger, level: :info

config :goth, json: {:system, "GCP_CREDENTIALS"}

config :core, :consumers, [
  Core.PubSub.Consumers.Fanout
]