defmodule Watchman.Application do
  use Application
  import Supervisor.Spec

  def start(_type, _args) do
    children = [
      WatchmanWeb.Endpoint,
      Watchman.Configuration,
      worker(Watchman.Deployer, [determine_storage()])
    ]

    opts = [strategy: :one_for_one, name: Watchman.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def config_change(changed, _new, removed) do
    WatchmanWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  # only support git for now
  defp determine_storage(), do: Watchman.Storage.Git
end
