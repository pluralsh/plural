use Mix.Config

config :core,
  ecto_repos: [Core.Repo],
  broker: Core.Conduit.Broker

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

config :email, EmailWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "bzUBoQlghS+mt8b6EDUZkJ5LuZaJ1I8lJnnJX2PHpDrunEF7pk6iXIEhB4v2QZbe",
  render_errors: [view: EmailWeb.ErrorView, accepts: ~w(html json), layout: false]

config :email,
  host: "example.com",
  consumers: []

config :core,
  host: "https://app.plural.sh"

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

config :core, :connection_draining,
  shutdown_delay_ms: 1

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

config :worker, Worker.Conduit.Broker,
  adapter: ConduitAMQP,
  url: "amqp://rabbitmq:rabbitmq@localhost"

config :libcluster, :topologies, []

config :core, start_broker: false
config :rtc, start_broker: false
config :worker, start_broker: false

# config :lager, :error_logger_redirect, false
# config :lager, :error_logger_whitelist, [Logger.ErrorHandler]

config :core, Core.Clients.Zoom,
  client_id: "dummy-id",
  stripe_connect_id: "dummy-secret",
  stripe_publishable_key: "pk-stripe"

config :worker,
  registry: "dkr.plural.sh",
  docker_env: []

config :core, Core.Influx,
  database: "plural"

config :cron, run: false

config :core,
  registry: "dkr.plural.sh",
  plural_cmd: "plural",
  stripe_connect_id: "ca_dummy",
  onplural_domain: "onplural.sh",
  gcp_organization: "1323",
  gcp_identity: "someone@example.com",
  vault: "https://vault.vault:8201",
  docker_env: []

config :briefly,
  directory: [{:system, "TMPDIR"}, {:system, "TMP"}, {:system, "TEMP"}, "/tmp"],
  default_prefix: "briefly",
  default_extname: ""

config :worker, rollout_pipeline: [
  Worker.Rollouts.Producer,
  {Worker.Rollouts.Pipeline, Worker.Rollouts.Producer}
]

config :worker, upgrade_pipeline: []
config :worker, demo_projects_pipeline: []
config :worker, docker_pipeline: []

config :core, Core.Clients.Hydra,
  hydra_admin: "http://plural-hydra-admin:4445",
  hydra_public: "http://plural-hydra-public:4444"

config :rtc, :flushable, false

config :hammer,
  backend: {Hammer.Backend.ETS, [expiry_ms: 60_000 * 60,
                                 cleanup_interval_ms: 60_000 * 10]}

config :worker,
  upgrade_interval: 10,
  demo_interval: 10,
  rollout_interval: 10,
  docker_interval: 60

import_config "#{Mix.env()}.exs"
