defmodule Cron.Application do
  use Application

  def start(_type, _args) do
    children = optionally_run() |> IO.inspect()

    opts = [strategy: :one_for_one, name: Cron.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def optionally_run() do
    case Application.get_env(:cron, :run) do
      true -> [{Cron.Runner, []}]
      false -> []
    end
  end
end
