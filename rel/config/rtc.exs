import Config
import System, only: [get_env: 1]

app = get_env("REPO_NAME") || "forge"

prefixed = fn name -> "#{app}-#{name}" end


config :rtc, RtcWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//#{prefixed.("rtc")}"],
  secret_key_base: get_env("SECRET_KEY_BASE"),
  server: true

config :core, broker: Rtc.Conduit.Broker
config :core, start_broker: false
config :rtc, start_broker: true

config :libcluster,
  topologies: [
    rtc: [
      strategy: Cluster.Strategy.Kubernetes,
      config: [
        mode: :ip,
        kubernetes_node_basename: "rtc",
        kubernetes_selector: "app=#{prefixed.("rtc")}",
        kubernetes_namespace: get_env("NAMESPACE"),
        polling_interval: 10_000
      ]
    ]
  ]
