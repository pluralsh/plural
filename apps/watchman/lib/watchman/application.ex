defmodule Watchman.Application do
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      WatchmanWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: Watchman.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def config_change(changed, _new, removed) do
    WatchmanWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
