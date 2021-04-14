import Config
import System, only: [get_env: 1]

app = get_env("REPO_NAME") || "forge"

prefixed = fn name -> "#{app}-#{name}" end

config :core, start_broker: true
config :rtc, start_broker: false

config :core, Core.Guardian,
  issuer: app,
  secret_key: get_env("JWT_SECRET")

config :stripity_stripe, api_key: get_env("STRIPE_SECRET")

config :api, ApiWeb.Endpoint,
  secret_key_base: get_env("SECRET_KEY_BASE")

config :libcluster,
  topologies: [
    api: [
      strategy: Cluster.Strategy.Kubernetes,
      config: [
        mode: :ip,
        kubernetes_node_basename: "forge",
        kubernetes_selector: "app=#{prefixed.("api")}",
        kubernetes_namespace: get_env("NAMESPACE"),
        polling_interval: 10_000
      ]
    ]
  ]
