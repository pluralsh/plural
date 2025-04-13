defmodule Api.Application do
  @moduledoc false

  use Application

  def start(_type, _args) do
    topologies = Application.get_env(:libcluster, :topologies)
    ApiWeb.Plugs.MetricsExporter.setup()
    children = [
      ApiWeb.Endpoint,
      {Bandit, plug: Core.MCP.Router, port: 3000},
      {FT.K8S.TrafficDrainHandler, Core.drain_config()},
      {Cluster.Supervisor, [topologies, [name: Api.ClusterSupervisor]]},
    ]

    opts = [strategy: :one_for_one, name: Api.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def config_change(changed, _new, removed) do
    ApiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
