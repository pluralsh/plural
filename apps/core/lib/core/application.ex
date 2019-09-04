defmodule Core.Application do
  use Application

  def start(_type, _args) do
    children = [
      Core.Repo
    ]

    opts = [strategy: :one_for_one, name: Core.Supervisor]
    Supervisor.start_link(children, opts)
  end
end