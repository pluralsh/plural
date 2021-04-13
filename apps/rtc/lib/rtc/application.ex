defmodule Rtc.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    topologies = Application.get_env(:libcluster, :topologies)
    RtcWeb.Plugs.MetricsExporter.setup()
    Application.get_env(:core, Core.Repo)
    |> IO.inspect()

    children = [
      {Phoenix.PubSub, name: Rtc.PubSub},
      Rtc.Presence,
      RtcWeb.Endpoint,
      {Cluster.Supervisor, [topologies, [name: Rtc.ClusterSupervisor]]},
      {Absinthe.Subscription, RtcWeb.Endpoint},
    ] ++ broker()

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Rtc.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    RtcWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  def broker() do
    case Application.get_env(:rtc, :start_broker) do
      true -> [{Rtc.Conduit.Broker, []}]
      _ -> []
    end
  end
end
