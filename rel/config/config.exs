import Config
import System, only: [get_env: 1]

config :api, ApiWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//chartmart-api"]

config :arc,
  storage: Arc.Storage.GCS,
  bucket: get_env("GCS_BUCKET")

config :core, Core.Repo,
  database: "chartmart",
  username: "chartmart",
  password: get_env("POSTGRES_PASSWORD"),
  hostname: "chartmart-postgresql"

config :core, :jwt,
  pk: get_env("JWT_PRIVATE_KEY"),
  cert: get_env("JWT_CERT"),
  iss: get_env("JWT_ISS"),
  aud: get_env("JWT_AUD")

config :piazza_core, aes_key: get_env("AES_KEY")

config :core, :chartmuseum, "http://chartmuseum:8080"