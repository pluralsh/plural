import Config
import System, only: [get_env: 1]

config :core, start_broker: true
config :rtc, start_broker: false

config :core, Core.Guardian,
  issuer: "plural",
  secret_key: get_env("JWT_SECRET")

config :stripity_stripe, api_key: get_env("STRIPE_SECRET")

config :api, ApiWeb.Endpoint,
  secret_key_base: get_env("SECRET_KEY_BASE")

if get_env("CLOUD_SHELL_IMG") do
  config :core, :cloud_shell_img, get_env("CLOUD_SHELL_IMG")
end

if get_env("CLOUD_SHELL_SYSBOX_IMG") do
  config :core, :cloud_shell_sysbox_img, get_env("CLOUD_SHELL_SYSBOX_IMG")
end

if get_env("CLOUD_SHELL_DIND_IMG") do
  config :core, :dind_img, get_env("CLOUD_SHELL_DIND_IMG")
end

if !get_env("PLRL_IGNORE_CLUSTER") do
config :libcluster,
  topologies: [
    api: [
      strategy: Cluster.Strategy.Kubernetes,
      config: [
        mode: :ip,
        kubernetes_node_basename: "plural",
        kubernetes_selector: "app=plural-api",
        kubernetes_namespace: get_env("NAMESPACE"),
        polling_interval: 10_000
      ]
    ]
  ]
end
