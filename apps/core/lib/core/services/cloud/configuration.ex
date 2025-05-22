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
      github_app_pem
      es_password
      prom_password
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
      approval: false,
      configuration: %{version: "1.8"},
      git: %{ref: "main", folder: "terraform/modules/dedicated/#{inst.cloud}"},
      environment: Enum.map(stack_environment(inst), fn {k, v} -> %{name: "TF_VAR_#{k}", value: "#{v}"} end)
    })
  end

  defp stack_environment(%ConsoleInstance{} = inst) do
    [
      region: inst.region,
      development: String.contains?(Core.conf(:dedicated_project), "dev"),
      cluster_name: "dedicated-#{inst.name}",
      size: inst.size,
      service_secrets: build(inst) |> Map.new(fn %{name: n, value: v} -> {n, v} end) |> Jason.encode!()
    ]
    |> add_network(inst)
    |> add_oidc(inst)
  end

  defp add_network(env, %ConsoleInstance{network: %ConsoleInstance.Network{allowed_cidrs: [_ | _] = cidrs}}) do
    env ++ [network_allowd_cidrs: Jason.encode!(cidrs)]
  end
  defp add_network(_, _), do: []

  defp add_oidc(env, %ConsoleInstance{oidc: %ConsoleInstance.OIDC{issuer: issuer, client_id: client_id, client_secret: client_secret}})
    when is_binary(issuer) and is_binary(client_id) and is_binary(client_secret) do
    env ++ [
      oidc_issuer: issuer,
      oidc_client_id: client_id,
      oidc_client_secret: client_secret
    ]
  end
  defp add_oidc(_, _), do: []

  # defp certificate(%ConsoleInstance{postgres: %PostgresCluster{certificate: cert}}), do: cert

  defp build_pg_url(%ConsoleInstance{type: :dedicated}), do: nil
  defp build_pg_url(%ConsoleInstance{
    configuration: %{dbuser: u, dbpassword: p, database: database},
    postgres: %PostgresCluster{host: host}
  }) do
    "postgresql://#{u}:#{p}@#{host}/#{database}"
  end
end
