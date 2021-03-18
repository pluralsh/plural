import Config
import System, only: [get_env: 1]

config :worker,
  registry: get_env("DKR_DNS")

config :worker, start_broker: true
