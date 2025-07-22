import Config
import System, only: [get_env: 1]

config :core, start_broker: true

config :stripity_stripe, api_key: get_env("STRIPE_SECRET")
