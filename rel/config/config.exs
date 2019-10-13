import Config
import System, only: [get_env: 1]

config :api, ApiWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//chartmart-api"]


config :core, Core.Repo,
  database: "chartmart",
  username: "chartmart",
  password: get_env("POSTGRES_PASSWORD"),
  hostname: "chartmart-postgresql"

config :core, :chartmuseum, "http://chartmart-chartmuseum:8080"