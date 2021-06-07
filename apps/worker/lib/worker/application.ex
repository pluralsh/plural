defmodule Worker.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application
  require Logger

  def start(_type, _args) do
    Logger.info "Starting worker"
    children =
      Worker.conf(:rollout_pipeline) ++
      Worker.conf(:upgrade_pipeline) ++
      broker()

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Worker.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def broker() do
    case Worker.conf(:start_broker) do
      true -> [{Worker.Conduit.Broker, []}]
      _ -> []
    end
  end
end
