defmodule Core.Application do
  use Application

  def start(_type, _args) do
    children = [
      Core.Repo,
      Core.PubSub.Broadcaster,
      Core.ReplicatedCache,
      Core.Cache,
      Core.Influx,
    ] ++ conf(:consumers, [])
      ++ broker()

    opts = [strategy: :one_for_one, name: Core.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def broker() do
    case conf(:start_broker) do
      true -> [{Core.Conduit.Broker, []}]
      _ -> []
    end
  end

  defp conf(value, default \\ nil), do: Application.get_env(:core, value, default)
end
