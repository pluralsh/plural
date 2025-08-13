defmodule Core.Services.Cloud.Configuration do
  alias Core.Schema.{ConsoleInstance, PostgresCluster}
  alias Core.Services.Cloud

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
      dbuser
      dbpassword
      database
    )a)
    |> Map.merge(%{
      postgres_url: build_pg_url(inst),
      postgres_cluster: pg_cluster(inst),
      cloud: "#{inst.cloud}",
      cluster_name: inst.name,
      size: "#{size}",
      vmetrics_tenant: vmetrics_tenant(inst),
      stage: Core.conf(:stage)
    })
    |> Map.merge(Map.new(add_oidc([], inst)))
    |> Map.merge(domain_info(inst))
    |> Map.put(:size, "#{size}")
    |> Enum.filter(fn {_, v} -> is_binary(v) end)
    |> Enum.map(fn {k, v} -> %{name: k, value: v} end)
  end

  defp domain_info(%ConsoleInstance{domain_version: :v2, name: name}) do
    %{
      domain_version: "v2",
      console_domain: "#{name}.console.#{Cloud.domain()}",
      kas_domain: "#{name}.kas.#{Cloud.domain()}"
    }
  end

  defp domain_info(%ConsoleInstance{name: name}) do
    %{
      domain_version: "v1",
      console_domain: "console.#{name}.#{Cloud.domain()}",
      kas_domain: "kas.#{name}.#{Cloud.domain()}"
    }
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
  defp add_network(env, _), do: env

  defp add_oidc(env, %ConsoleInstance{oidc: %ConsoleInstance.OIDC{issuer: issuer, client_id: client_id, client_secret: client_secret}})
    when is_binary(issuer) and is_binary(client_id) and is_binary(client_secret) do
    env ++ [
      oidc_issuer: Path.join(issuer, ".well-known/openid-configuration"),
      oidc_client_id: client_id,
      oidc_client_secret: client_secret
    ]
  end
  defp add_oidc(env, _), do: env

  # defp certificate(%ConsoleInstance{postgres: %PostgresCluster{certificate: cert}}), do: cert

  defp build_pg_url(%ConsoleInstance{type: :dedicated}), do: nil
  defp build_pg_url(%ConsoleInstance{
    configuration: %{dbuser: u, dbpassword: p, database: database},
    postgres: %PostgresCluster{host: host}
  }) do
    "postgresql://#{u}:#{p}@#{host}/#{database}"
  end

  defp pg_cluster(%ConsoleInstance{postgres: %PostgresCluster{name: name}})
    when is_binary(name), do: name
  defp pg_cluster(_), do: nil

  def vmetrics_tenant(%ConsoleInstance{id: id}) do
    # use implicit 32 bit integer from instance id to infer the tenant id (which has to be that datatype)
    <<tenant::binary-size(4), _rest::binary>> = UUID.string_to_binary!(id)
    "#{:binary.decode_unsigned(tenant, :big)}"
  end
end
