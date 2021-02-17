import Config

config :core, start_broker: false
config :rtc, start_broker: true

config :core, Core.Guardian,
  issuer: "forge",
  secret_key: get_env("JWT_SECRET")

config :rtc, RtcWeb.Endpoint,
  secret_key_base: get_env("SECRET_KEY_BASE")

config :libcluster,
  topologies: [
    api: [
      strategy: Cluster.Strategy.Kubernetes,
      config: [
        mode: :ip,
        kubernetes_node_basename: "rtc",
        kubernetes_selector: "app=forge-rtc",
        kubernetes_namespace: get_env("NAMESPACE"),
        polling_interval: 10_000
      ]
    ]
  ]
