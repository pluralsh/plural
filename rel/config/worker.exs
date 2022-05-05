import Config
import System, only: [get_env: 1]

config :worker,
  registry: get_env("DKR_DNS")

config :core, start_broker: false
config :worker, start_broker: true
config :core, broker: Worker.Conduit.Broker
