defmodule Core.Application do
  use Application

  def start(_type, _args) do
    if Application.get_env(:sentry, :dsn) do
      :logger.add_handler(:sentry_logger, Sentry.LoggerHandler, %{
        config: %{metadata: [:file, :line]}
      })
    end

    if Application.get_env(:cloudflare, :auth_token) not in [nil, ""] do
      Cloudflare.Client.init()
    end

    children = [
      Core.Repo,
      Core.PubSub.Broadcaster,
      Core.ReplicatedCache,
      Core.Cache,
      Core.Influx,
      Core.Buffers.Supervisor,
      {OpenIDConnect.Worker, Application.get_env(:core, :oidc_providers)},
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
