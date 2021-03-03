import Config
import System, only: [get_env: 1]

config :api, ApiWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//forge-api"]

config :rtc, RtcWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//forge-rtc"]

config :arc,
  storage: Arc.Storage.GCS,
  bucket: get_env("GCS_BUCKET")

config :core, Core.Guardian,
  issuer: "forge",
  secret_key: get_env("JWT_SECRET")

config :core, Core.Repo,
  database: "forge",
  username: "forge",
  password: get_env("POSTGRES_PASSWORD"),
  hostname: "forge-postgresql",
  pool_size: 10

config :core, :jwt,
  pk: get_env("JWT_PRIVATE_KEY"),
  cert: get_env("JWT_CERT"),
  iss: get_env("JWT_ISS"),
  aud: get_env("JWT_AUD")

config :core, Core.Conduit.Broker,
  adapter: ConduitAMQP,
  url: "amqp://user:#{get_env("RABBITMQ_PASSWORD")}@forge-rabbitmq"

config :rtc, Rtc.Conduit.Broker,
  adapter: ConduitAMQP,
  url: "amqp://user:#{get_env("RABBITMQ_PASSWORD")}@forge-rabbitmq"

config :piazza_core, aes_key: get_env("AES_KEY")

config :core, :chartmuseum, "http://chartmuseum:8080"
