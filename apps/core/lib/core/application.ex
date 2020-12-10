defmodule Core.Application do
  use Application

  def start(_type, _args) do
    children = [
      Core.Repo,
      Core.PubSub.Broadcaster,
      Core.ReplicatedCache,
      Core.Cache,
    ] ++ consumers()

    opts = [strategy: :one_for_one, name: Core.Supervisor]
    Supervisor.start_link(children, opts)
  end

  defp consumers(), do: Application.get_env(:core, :consumers, [])
end