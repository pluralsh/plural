defmodule GraphQl.Resolvers.Dns do
  use GraphQl.Resolvers.Base, model: Core.Schema.DnsDomain
  alias Core.Schema.DnsRecord
  alias Core.Services.Dns

  def query(DnsRecord, _), do: DnsRecord
  def query(_, _), do: DnsDomain

  def list_domains(args, %{context: %{current_user: user}}) do
    DnsDomain.for_account(user.account_id)
    |> DnsDomain.ordered()
    |> paginate(args)
  end

  def list_records(%{domain_id: id} = args, %{context: %{current_user: user}})
      when is_binary(id) do
    DnsRecord.for_domain(id)
    |> DnsRecord.ordered()
    |> paginate(args)
  end

  def list_records(%{cluster: cluster, provider: prov} = args, %{context: %{current_user: user}}) do
    DnsRecord.for_creator(user.id)
    |> DnsRecord.for_cluster(cluster)
    |> DnsRecord.for_provider(prov)
    |> DnsRecord.ordered()
    |> paginate(args)
  end

  def create_domain(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Dns.create_domain(attrs, user)

  def create_record(%{attributes: attrs, cluster: cluster, provider: prov}, %{context: %{current_user: user}}),
    do: Dns.create_record(attrs, cluster, prov, user)

  def delete_record(%{name: name, type: type}, %{context: %{current_user: user}}),
    do: Dns.delete_record(name, type, user)
end
