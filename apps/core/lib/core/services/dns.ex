defmodule Core.Services.Dns do
  use Core.Services.Base
  import Core.Policies.Dns

  alias Core.Schema.{DnsDomain, DnsRecord, User}
  alias Cloudflare.DnsRecord, as: Record
  require Logger

  @ttl 120
  @type error :: {:error, term}

  def get_domain(name), do: Core.Repo.get_by(DnsDomain, name: name)

  @spec create_domain(map, User.t) :: {:ok, DnsDomain.t} | error
  def create_domain(attrs, %User{id: id, account_id: aid} = user) do
    %DnsDomain{creator_id: id, account_id: aid}
    |> DnsDomain.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  @spec create_record(map, binary, atom, User.t) :: {:ok, DnsRecord.t} | error
  def create_record(%{name: name, type: t} = attrs, cluster, provider, %User{} = user) do
    start_transaction()
    |> add_operation(:domain, fn _ ->
      domain_name(name)
      |> get_domain()
      |> case do
        %DnsDomain{} = d -> {:ok, d}
        nil -> {:error, "domain not found"}
      end
    end)
    |> add_operation(:fetch, fn _ ->
      {:ok, Core.Repo.get_by(DnsRecord, name: name, type: t)}
    end)
    |> add_operation(:record, fn
      %{fetch: nil, domain: domain} ->
        %DnsRecord{creator_id: user.id, domain_id: domain.id}
        |> DnsRecord.changeset(Map.merge(attrs, %{cluster: cluster, provider: provider}))
        |> DnsRecord.dns_valid(domain.name)
        |> allow(user, :create)
        |> when_ok(:insert)
      %{fetch: %DnsRecord{cluster: ^cluster, provider: ^provider} = record} ->
        DnsRecord.changeset(record, attrs)
        |> allow(user, :edit)
        |> when_ok(:update)
      %{fetch: %DnsRecord{cluster: c, provider: p}} ->
        {:error, "This record already is in use by #{p}/#{c}"}
    end)
    |> add_operation(:external, fn
      %{fetch: nil, record: record} ->
        cloudflare_record(record)
        |> Record.create(params: [zone_id: zone_id()])
        |> extract_id()
      %{record: %{external_id: id} = record} ->
        Record.update(id, cloudflare_record(record), params: [zone_id: zone_id()])
        |> extract_id()
    end)
    |> add_operation(:hydrate, fn %{record: r, external: id} ->
      DnsRecord.changeset(r, %{external_id: id})
      |> Core.Repo.update()
    end)
    |> execute(extract: :hydrate)
  end

  @spec delete_record(binary, atom, User.t) :: {:ok, DnsRecord.t} | error
  def delete_record(name, type, %User{} = user) do
    start_transaction()
    |> add_operation(:record, fn _ ->
      Core.Repo.get_by!(DnsRecord, name: name, type: type)
      |> allow(user, :delete)
      |> when_ok(:delete)
    end)
    |> add_operation(:external, fn %{record: r} ->
      Record.delete(r.external_id)
    end)
    |> execute(extract: :record)
  end

  defp cloudflare_record(%DnsRecord{name: name, type: t, records: r}) do
    %{
      name: name,
      type: String.upcase("#{t}"),
      content: Enum.join(r, "\n"),
      ttl: @ttl
    }
  end

  defp extract_id({:ok, %{body: %{"result" => %{"id" => id}}}}), do: {:ok, id}
  defp extract_id(error) do
    Logger.error "Cloudflare failed with #{inspect(error)}"
    {:error, "cloudflare failure"}
  end

  defp domain_name(name) do
    [_ | rest] = String.split(name, ".")
    Enum.join(rest, ".")
  end

  defp zone_id(), do: Core.conf(:cloudflare_zone)
end
