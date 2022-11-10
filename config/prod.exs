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

config :email, EmailWeb.Endpoint,
  url: [port: 4001],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: false

config :logger, level: :info

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

config :core, Core.Email.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: {:system, "SENGRID_API_KEY"}

config :worker, docker_env: [
  # {"DOCKER_HOST", "tcp://localhost:2376"},
  # {"DOCKER_CERT_PATH", "/certs/client"},
  # {"DOCKER_TLS_VERIFY", "1"},
]

config :core, docker_env: [
  # {"DOCKER_HOST", "tcp://localhost:2376"},
  # {"DOCKER_CERT_PATH", "/certs/client"},
  # {"DOCKER_TLS_VERIFY", "1"},
]

config :ex_aws,
  region: {:system, "AWS_REGION"},
  secret_access_key: [{:system, "AWS_ACCESS_KEY_ID"}, {:awscli, "profile_name", 30}],
  access_key_id: [{:system, "AWS_SECRET_ACCESS_KEY"}, {:awscli, "profile_name", 30}],
  awscli_auth_adapter: ExAws.STS.AuthCache.AssumeRoleWebIdentityAdapter

config :cron, run: true

config :worker, upgrade_pipeline: [
  {Worker.Upgrades.Producer, [type: :chart, name: Worker.Upgrades.ChartProducer]},
  {Worker.Upgrades.Producer, [type: :terraform, name: Worker.Upgrades.TFProducer]},
  {Worker.Upgrades.Pipeline, [Worker.Upgrades.ChartProducer, Worker.Upgrades.TFProducer]}
]

config :worker, demo_projects_pipeline: [
  Worker.DemoProjects.Producer,
  {Worker.DemoProjects.Pipeline, Worker.DemoProjects.Producer}
]

config :worker, rollout_pipeline: [
  Worker.Rollouts.Producer,
  {Worker.Rollouts.Pipeline, Worker.Rollouts.Producer}
]

config :worker, docker_pipeline: [
  Worker.Docker.Producer,
  {Worker.Docker.Pipeline, Worker.Docker.Producer},
]

config :goth,
  disabled: true

config :kazan, :server, :in_cluster
config :rtc, :flushable, true
