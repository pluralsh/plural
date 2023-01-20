defmodule Core.Services.Clusters do
  use Core.Services.Base
  import Core.Policies.Cluster
  alias Core.Services.{Dns, Repositories}
  alias Core.Schema.{Cluster, User, DnsRecord, UpgradeQueue}

  @type error :: {:error, term}
  @type cluster_resp :: {:ok, Cluster.t} | error

  @spec get_cluster(binary, atom, binary) :: Cluster.t | nil
  def get_cluster(account_id, provider, name) do
    Core.Repo.get_by(Cluster, account_id: account_id, provider: provider, name: name)
  end

  def get_cluster_by_owner(user_id) do
    Core.Repo.get_by(Cluster, owner_id: user_id)
  end

  @doc """
  Determines if a user has access to the cluster referenced by `id`
  """
  @spec authorize(binary, User.t) :: cluster_resp
  def authorize(id, %User{} = user) when is_binary(id) do
    Core.Repo.get(Cluster, id)
    |> Core.Repo.preload([owner: [impersonation_policy: :bindings]])
    |> allow(user, :access)
  end

  @doc """
  creates a cluster reference with this user as the marked owner
  """
  @spec create_cluster(map, User.t) :: cluster_resp
  def create_cluster(attrs, %User{id: user_id, account_id: account_id} = user) do
    %Cluster{owner_id: user_id, account_id: account_id}
    |> Cluster.changeset(Map.put_new_lazy(attrs, :source, fn -> Repositories.installation_source(user) end))
    |> Core.Repo.insert()
  end

  @doc """
  creates a cluster record from an upgrade queue.  Also ties the cluster back onto that queue
  """
  @spec create_from_queue(UpgradeQueue.t) :: cluster_resp
  def create_from_queue(%UpgradeQueue{name: n, provider: p, git: g, domain: d, user_id: uid, pinged_at: pinged} = q) do
    %{user: user} = Core.Repo.preload(q, [:user])

    start_transaction()
    |> add_operation(:cluster, fn _ ->
      case get_cluster_by_owner(uid) do
        %Cluster{} = c ->
          Cluster.changeset(c, %{console_url: d, provider: p, name: n})
          |> Core.Repo.update()
        _ ->
          create_cluster(%{
            name: n,
            provider: p,
            git_url: g,
            console_url: d,
            domain: infer_domain(d),
            pinged_at: pinged
          }, user)
      end
    end)
    |> add_operation(:queue, fn %{cluster: %Cluster{id: id}} ->
      UpgradeQueue.changeset(q, %{cluster_id: id})
      |> Core.Repo.update()
    end)
    |> execute(extract: :cluster)
  end

  defp infer_domain(console_url) when is_binary(console_url) do
    case String.split(console_url, ".") do
      [_ | rest] when rest != [] -> Enum.join(rest, ".")
      _ -> nil
    end
  end
  defp infer_domain(_), do: nil

  @doc """
  deletes the cluster reference and flushes associated records
  """
  @spec delete_cluster(binary, binary, User.t) :: cluster_resp
  def delete_cluster(name, provider, %User{id: user_id} = user) do
    start_transaction()
    |> add_operation(:cluster, fn _ ->
      case get_cluster(user.account_id, provider, name) do
        %Cluster{owner_id: ^user_id} = cluster -> Core.Repo.delete(cluster)
        %Cluster{} -> {:error, "cannot delete a cluster you don't own"}
        nil -> {:error, "not found"}
      end
    end)
    |> add_operation(:rest, fn %{cluster: cluster} -> {:ok, flush_dns(cluster)} end)
    |> execute(extract: :cluster)
  end

  defp flush_dns(%Cluster{name: name, provider: p, owner_id: user_id, domain: domain}) when is_binary(domain) do
    Dns.get_domain(domain)
    |> Dns.records()
    |> Enum.filter(fn
      %DnsRecord{cluster: ^name, provider: ^p, creator_id: ^user_id} -> true
      _ -> false
    end)
    |> Enum.each(&Core.Conduit.Broker.publish(%Conduit.Message{body: &1}, :cluster))
  end
  defp flush_dns(_), do: :ok
end
