defmodule Core.Services.Cloud.Configuration do
  alias Core.Schema.{ConsoleInstance, CockroachCluster}

  def build(%ConsoleInstance{configuration: conf, size: size} = inst) do
    Map.take(conf, ~w(
      subdomain
      jwt_secret
      owner_name
      owner_email
      admin_password
      aes_key
      encryption_key
      client_id
      client_secret
      plural_token
      kas_api
      kas_private
      kas_redis
    )a)
    |> Map.put(:postgres_url, build_pg_url(inst))
    |> Map.put(:size, "#{size}")
    |> Enum.map(fn {k, v} -> %{name: Macro.camelize("#{k}"), value: v} end)
  end

  defp build_pg_url(%ConsoleInstance{
    configuration: %{dbuser: u, dbpassword: p, database: database},
    region: region,
    cockroach: %CockroachCluster{endpoints: endpoints}
  }) do
    "postgresql://#{u}:#{p}@#{endpoints[region]}/#{database}"
  end
end
