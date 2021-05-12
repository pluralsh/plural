import Config
import System, only: [get_env: 1]

config :api, ApiWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//plural-api"]

config :rtc, RtcWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//plural-rtc"]

config :email, host: get_env("HOST")

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
  hostname: "plural-postgresql",
  pool_size: 5

config :core, Core.Influx,
  database: "plural",
  host: "plural-influxdb",
  auth: [method: :basic, username: "plural", password: get_env("INFLUX_PAASSWORD")],
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
  stripe_publishable_key: get_env("STRIPE_PUBLISHABLE_KEY")

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
