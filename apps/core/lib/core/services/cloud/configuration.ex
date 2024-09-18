defmodule Core.Services.Cloud.Configuration do
  alias Core.Schema.{ConsoleInstance, PostgresCluster}

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
      erlang_secret
    )a)
    |> Map.merge(%{
      postgres_url: build_pg_url(inst),
      cloud: "#{inst.cloud}",
      cluster_name: inst.name,
      size: "#{size}",
    })
    |> Map.put(:size, "#{size}")
    |> Enum.filter(fn {_, v} -> is_binary(v) end)
    |> Enum.map(fn {k, v} -> %{name: k, value: v} end)
  end

  def stack_attributes(%ConsoleInstance{name: name} = inst, attrs) do
   Map.merge(attrs, %{
      name: "dedicated-#{name}",
      cluster_id: Core.conf(:mgmt_cluster),
      type: "TERRAFORM",
      manageState: true,
      approval: true,
      configuration: %{version: "1.8"},
      git: %{ref: "main", folder: "terraform/modules/dedicated/#{inst.cloud}"},
      environment: Enum.map([
        region: inst.region,
        development: String.contains?(Core.conf(:dedicated_project), "dev"),
        cluster_name: "dedicated-#{inst.name}",
        size: inst.size,
        service_secrets: build(inst) |> Map.new(fn %{name: n, value: v} -> {n, v} end) |> Jason.encode!()
      ], fn {k, v} -> %{name: "TF_VAR_#{k}", value: "#{v}"} end)
    })
  end

  # defp certificate(%ConsoleInstance{postgres: %PostgresCluster{certificate: cert}}), do: cert

  defp build_pg_url(%ConsoleInstance{type: :dedicated}), do: nil
  defp build_pg_url(%ConsoleInstance{
    configuration: %{dbuser: u, dbpassword: p, database: database},
    postgres: %PostgresCluster{host: host}
  }) do
    "postgresql://#{u}:#{p}@#{host}/#{database}"
  end
end
