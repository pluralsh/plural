use Mix.Config

config :core,
  ecto_repos: [Core.Repo]

config :piazza_core,
  repos: [Core.Repo]

config :piazza_core,
  shutdown_delay: 60 * 1000

config :api, ApiWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "1rkd5+lxJbdTadyxW7qF/n1fNzKPV010PKf8SEGmUrXwMw0iAZyoyZgWEwr6nmCJ",
  render_errors: [view: ApiWeb.ErrorView, accepts: ~w(html json)],
  server: true


# Configures the endpoint
config :rtc, RtcWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "xFC5PDvhCrg1iTQ3FM6uMfDGVIIIHE5wdyIwn9FXCwJXOQsTQ/kPFRtP5z6Z/1/a",
  render_errors: [view: RtcWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Rtc.PubSub,
  live_view: [signing_salt: "lFfrgo20"],
  server: true


config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

config :core, Core.Guardian,
  issuer: "forge",
  secret_key: "forge_secret"

config :core, :chartmuseum, "http://localhost:8080"

config :core, Core.Services.Payments,
  application_fee: 5

config :botanist,
  ecto_repo: Core.Repo

config :arc,
  storage: Arc.Storage.GCS,
  bucket: "forge-assets"

config :stripity_stripe,
  hackney_opts: [connect_timeout: 5000, recv_timeout: 60_000]

config :core, Core.Email.Mailer,
  adapter: Bamboo.LocalAdapter

config :core, Core.PartitionedCache,
  primary: [
    gc_interval: :timer.seconds(3600),
    backend: :shards,
    partitions: 2,
    allocated_memory: 1000 * 1000 * 500
  ]

config :core, Core.Cache,
  local: Core.Cache.Local,
  node_selector: Nebulex.Adapters.Dist

config :core, Core.Conduit.Broker,
  adapter: ConduitAMQP,
  url: "amqp://rabbitmq:rabbitmq@localhost"

config :rtc, Rtc.Conduit.Broker,
  adapter: ConduitAMQP,
  url: "amqp://rabbitmq:rabbitmq@localhost"

config :libcluster, :topologies, []

config :core, start_broker: false
config :rtc, start_broker: false

config :lager, :error_logger_redirect, false
config :lager, :error_logger_whitelist, [Logger.ErrorHandler]

import_config "#{Mix.env()}.exs"
