defmodule Core.Application do
  use Application

  def start(_type, _args) do
    if Application.get_env(:sentry, :dsn) do
      Logger.add_backend(Sentry.LoggerBackend)
    end

    Cloudflare.Client.init()

    children = [
      Core.Repo,
      Core.PubSub.Broadcaster,
      Core.ReplicatedCache,
      Core.Cache,
      Core.Influx,
      Core.Buffers.Supervisor
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
