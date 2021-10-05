import Config
import System, only: [get_env: 1]

config :api, ApiWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//plural-api"]

config :rtc, RtcWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//plural-rtc"]

config :email, host: "https://#{get_env("HOST")}"
config :core, host: "https://#{get_env("HOST")}"

config :arc,
  storage: Arc.Storage.GCS,
  bucket: get_env("BUCKET")

config :core, Core.Guardian,
  issuer: "plural",
  secret_key: get_env("JWT_SECRET")

config :core, Core.Repo,
  database: "plural",
  username: "plural",
  password: get_env("POSTGRES_PASSWORD"),
  hostname: get_env("DBHOST") || "plural-postgresql",
  ssl: String.to_existing_atom(get_env("DBSSL") || "false"),
  pool_size: 5

config :cloudflare,
  auth_token: get_env("CLOUDFLARE_AUTH_TOKEN")

config :core, Core.Influx,
  database: "plural",
  host: "influxdb.influx",
  auth: [method: :basic, username: "admin", password: get_env("INFLUX_PAASSWORD")],
  port: 8086

config :core, :jwt,
  pk: get_env("JWT_PRIVATE_KEY"),
  cert: get_env("JWT_CERT"),
  iss: get_env("JWT_ISS"),
  aud: get_env("JWT_AUD")

config :core, Core.Conduit.Broker,
  adapter: ConduitAMQP,
  url: "amqp://#{get_env("RABBIT_USERNAME")}:#{get_env("RABBIT_PASSWORD")}@rabbitmq.#{get_env("RABBIT_NAMESPACE")}"

config :rtc, Rtc.Conduit.Broker,
  adapter: ConduitAMQP,
  url: "amqp://#{get_env("RABBIT_USERNAME")}:#{get_env("RABBIT_PASSWORD")}@rabbitmq.#{get_env("RABBIT_NAMESPACE")}"

config :worker, Worker.Conduit.Broker,
  adapter: ConduitAMQP,
  url: "amqp://#{get_env("RABBIT_USERNAME")}:#{get_env("RABBIT_PASSWORD")}@rabbitmq.#{get_env("RABBIT_NAMESPACE")}"

config :piazza_core, aes_key: get_env("AES_KEY")

config :core, Core.Clients.Zoom,
  client_id: get_env("ZOOM_CLIENT_ID"),
  client_secret: get_env("ZOOM_CLIENT_SECRET")

config :core,
  chartmuseum: "http://chartmuseum:8080",
  plural_cmd: "/usr/local/bin/plural",
  stripe_connect_id: get_env("STRIPE_CONNECT_ID"),
  stripe_publishable_key: get_env("STRIPE_PUBLISHABLE_KEY"),
  hydra_public_url: get_env("HYDRA_URL") || "https://oidc.plural.sh",
  git_commit: get_env("GIT_COMMIT"),
  cloudflare_zone: get_env("CLOUDFLARE_ZONE"),
  acme_key_id: get_env("ACME_KEY_ID"),
  acme_secret: get_env("ACME_SECRET"),
  zerossl_access_key: get_env("ZEROSSL_ACCESS_KEY"),
  docker_metrics_table: ~s("permanent"."downsampled_docker_pulls")

provider = case get_env("PROVIDER") || "google" do
  "google" -> :gcp
  "gcp" -> :gcp
  "aws" -> :aws
  "azure" -> :azure
  _ -> :custom
end

if provider != :gcp do
  config :goth, disabled: true
  config :arc, storage: Arc.Storage.S3
end

config :core,
  registry: get_env("DKR_DNS")
