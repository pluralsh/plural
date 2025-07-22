import Config

config :core,
  ecto_repos: [Core.Repo],
  broker: Core.Conduit.Broker,
  env: config_env(),
  hostname: "app.plural.sh"

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

config :reverse_proxy_plug, :http_client, ReverseProxyPlug.HTTPClient.Adapters.HTTPoison

config :core, Core.Guardian,
  issuer: "app.plural.sh",
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
    gc_interval: :timer.hours(1),
    partitions: 2,
    allocated_memory: 1000 * 1000 * 500
  ]

config :core, Core.Cache,
  local: Core.Cache.Local,
  node_selector: Nebulex.Adapters.Dist,
  primary: [
    gc_interval: :timer.hours(1),
    partitions: 2,
    allocated_memory: 1000 * 1000 * 500
  ],
  gc_interval: :timer.hours(1),
  partitions: 2,
  allocated_memory: 1000 * 1000 * 500

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
  vault: "https://vault.plural.sh:443",
  docker_env: [],
  openai_token: "openai",
  stripe_webhook_secret: "bogus",
  github_demo_token: "test-pat",
  github_demo_org: "pluralsh-demos",
  trial_plan: "Pro Trial",
  console_token: "bogus",
  console_url: "https://console.example.com",
  dedicated_console_token: "bogus",
  mgmt_cluster: "dummy",
  dedicated_project: "dedicated",
  sysbox_emails: [],
  mgmt_repo: "https://github.com/pluralsh/plural.git",
  cockroach_parameters: [],
  bootstrap_ssl: true,
  intercom_salt: "intercomsalt",
  cloud_domain: "cloud.plural.sh",
  base_stripe_product: "test-base",
  metered_stripe_product: "test-metered",
  cluster_meter_name: "pro_clusters",
  initial_user: "admin@plural.sh",
  stage: "prod"

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
  hydra_admin: "http://plural-hydra-admin:4445/admin",
  hydra_public: "http://plural-hydra-public:4444"

config :rtc, :flushable, false

config :mime, :types, %{
  "text/event-stream" => ["sse"]
}

config :mcp_sse, :mcp_server, Core.MCP.Server


config :hammer,
  backend: {Hammer.Backend.ETS, [expiry_ms: 60_000 * 60,
                                 cleanup_interval_ms: 60_000 * 10]}

config :worker,
  upgrade_interval: 10,
  demo_interval: 10,
  rollout_interval: 10,
  docker_interval: 60

config :junit_formatter,
  print_report_file: true,
  automatic_create_dir?: true

config :core, :oidc_providers,
  github_actions: [
    discovery_document_uri: "https://token.actions.githubusercontent.com/.well-known/openid-configuration",
  ]

config :recaptcha,
  json_library: Jason,
  public_key: {:system, "RECAPTCHA_SITE_KEY"},
  secret: {:system, "RECAPTURE_SECRET_KEY"}

config :tzdata, :autoupdate, :disabled

import_config "#{config_env()}.exs"
