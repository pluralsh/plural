defmodule Core.Services.Clusters do
  use Core.Services.Base
  import Core.Policies.Cluster
  alias Core.PubSub
  alias Core.Policies.Account, as: AccountPolicy
  alias Core.Services.{Dns, Repositories, Users, Clusters.Transfer}
  alias Core.Schema.{Cluster, User, DnsRecord, UpgradeQueue, ClusterDependency}

  @type error :: {:error, term}
  @type cluster_resp :: {:ok, Cluster.t} | error
  @type cluster_dep_resp :: {:ok, ClusterDependency.t} | error

  @spec get_cluster(binary, atom, binary) :: Cluster.t | nil
  def get_cluster(user_id, provider, name) do
    Core.Repo.get_by(Cluster, owner_id: user_id, provider: provider, name: name)
  end

  @spec get_cluster!(binary) :: Cluster.t | nil
  def get_cluster!(id), do: Core.Repo.get!(Cluster, id)

  @spec get_cluster_by_owner(binary) :: Cluster.t | nil
  def get_cluster_by_owner(user_id), do: Core.Repo.get_by(Cluster, owner_id: user_id)

  @doc """
  Determines if a user has access to the cluster referenced by `id`
  """
  @spec authorize(binary, User.t) :: cluster_resp
  def authorize(%Cluster{} = c, %User{} = u) do
    Core.Repo.preload(c, [owner: [impersonation_policy: :bindings]], force: true)
    |> allow(u, :access)
  end
  def authorize(id, user) when is_binary(id) do
    Core.Repo.get(Cluster, id)
    |> authorize(user)
  end
  def authorize(nil, _), do: {:error, "not found"}

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
  Transfers ownership of a cluster to a new user.  This has three main components:
  * replicate the installations from one owner to another, this includes moving oidc providers
  * transfer ownership of any associated dns records
  * rewire the owner record of the cluster itself
  """
  @spec transfer_ownership(binary, User.t | binary, User.t) :: cluster_resp
  def transfer_ownership(name, %User{service_account: true} = sa, %User{provider: p, id: id} = user) do
    with {:ok, _} <- AccountPolicy.allow(sa, user, :impersonate) do
      %Cluster{} = old = Core.Repo.get_by!(Cluster, owner_id: id, provider: p, name: name)
      start_transaction()
      |> add_operation(:insts, fn _ ->
        Transfer.transfer_installations(user, sa)
      end)
      |> add_operation(:dns, fn _ ->
        {:ok, Transfer.transfer_domains(user, sa, old)}
      end)
      |> add_operation(:cluster, fn _ ->
        Cluster.changeset(old, %{owner_id: sa.id})
        |> Core.Repo.update()
      end)
      |> execute(extract: :cluster)
    end
  end
  def transfer_ownership(name, email, user) when is_binary(email),
    do: transfer_ownership(name, Users.get_user_by_email!(email), user)
  def transfer_ownership(_, _, _), do: {:error, "you can only transfer ownership to a service account"}

  @doc """
  creates a cluster record from an upgrade queue.  Also ties the cluster back onto that queue
  """
  @spec create_from_queue(UpgradeQueue.t) :: cluster_resp
  def create_from_queue(%UpgradeQueue{name: n, provider: p, git: g, domain: d, user_id: uid, pinged_at: pinged} = q) do
    %{user: user} = Core.Repo.preload(q, [:user])

    start_transaction()
    |> add_operation(:cluster, fn _ ->
      case get_cluster(user.id, p, n) do
        %Cluster{} = c ->
          Cluster.changeset(c, %{console_url: d, provider: p, name: n, owner_id: uid})
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
  Creates a cluster dependency, which will be used for guiding promotion flows
  """
  @spec create_dependency(Cluster.t, Cluster.t, User.t) :: cluster_dep_resp
  def create_dependency(%Cluster{owner_id: o}, %Cluster{owner_id: o}, _),
    do: {:error, "the cluster must have a different owner"}
  def create_dependency(%Cluster{provider: p} = source, %Cluster{provider: p} = dest, %User{} = user) do
    with {:ok, source} <- authorize(source, user),
         {:ok, %{owner: dest_owner} = dest} <- authorize(dest, user) do
      start_transaction()
      |> add_operation(:dep, fn _ ->
        %ClusterDependency{}
        |> ClusterDependency.changeset(%{dependency_id: source.id, cluster_id: dest.id})
        |> Core.Repo.insert()
      end)
      |> add_operation(:promote, fn _ -> do_promote(dest_owner) end)
      |> execute(extract: :dep)
      |> notify(:create, user)
    end
  end
  def create_dependency(_, _, _), do: {:error, "cluster dependencies must be for the same provider"}

  @doc """
  Grabs the new promote waterline from a user's cluster deps and writes all pending deferred updates to
  be dequeueable.
  """
  @spec promote(User.t) :: {:ok, User.t} | error
  def promote(%User{upgrade_to: to} = user) when is_binary(to) do
    start_transaction()
    |> add_operation(:user, fn _ -> do_promote(user) end)
    |> add_operation(:kick, fn _ -> Core.Services.Upgrades.kick(user) end)
    |> execute(extract: :user)
  end
  def promote(_), do: {:error, "this user doesn't have promotions enabled"}

  defp do_promote(%User{} = user) do
    line = waterline(user)
    Ecto.Changeset.change(user, %{upgrade_to: line || Piazza.Ecto.UUID.generate_monotonic()})
    |> Core.Repo.update()
  end

  @doc """
  Gets the waterline for a users promotions from all dependency clusters
  """
  @spec waterline(User.t) :: integer | nil
  def waterline(%User{id: user_id}) do
    ClusterDependency.waterline(user_id)
    |> Core.Repo.one()
  end

  @doc """
  deletes the cluster reference and flushes associated records
  """
  @spec delete_cluster(binary, binary | atom, User.t | binary) :: cluster_resp
  def delete_cluster(name, provider, %User{id: user_id} = user) do
    start_transaction()
    |> add_operation(:cluster, fn _ ->
      case get_cluster(user_id, provider, name) do
        %Cluster{} = cluster -> Core.Repo.delete(cluster)
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

  defp notify({:ok, %ClusterDependency{} = dep}, :create, user),
    do: handle_notify(PubSub.ClusterDependencyCreated, dep, actor: user)
  defp notify(error, _, _), do: error
end
