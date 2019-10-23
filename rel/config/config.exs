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

config :core, :chartmuseum, "http://chartmuseum:8080"