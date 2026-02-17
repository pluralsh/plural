defmodule Core.Services.Clusters do
  use Core.Services.Base
  import Core.Policies.Cluster
  alias Core.PubSub
  alias Core.Policies.Account, as: AccountPolicy
  alias Core.Services.{Dns, Repositories, Users, Clusters.Transfer}
  alias Core.Schema.{Cluster, User, DnsRecord, UpgradeQueue, ClusterDependency, ClusterUsageHistory, Installation}
  require Logger

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

  @spec get_cluster_by_url(binary) :: Cluster.t | nil
  def get_cluster_by_url(url), do: Core.Repo.get_by(Cluster, console_url: url)

  @spec has_cluster?(User.t) :: boolean
  def has_cluster?(%User{id: user_id}) do
    Cluster.for_user(user_id)
    |> Core.Repo.exists?()
  end

  @doc """
  Attempts to compute the service count for all clusters in an account
  """
  @spec services(binary) :: integer | nil
  def services(account_id) do
    Cluster.for_account(account_id)
    |> Cluster.services()
    |> Core.Repo.one()
  end

  @doc """
  Attempts to compute the cluster count for all clusters in an account
  """
  @spec clusters(binary) :: integer | nil
  def clusters(account_id) do
    Cluster.for_account(account_id)
    |> Cluster.clusters()
    |> Core.Repo.one()
  end

  @doc """
  Determines if all installations for a cluster have been synced
  """
  @spec synced?(Cluster.t) :: boolean
  def synced?(%Cluster{owner_id: uid}) do
    !(Installation.for_user(uid)
      |> Installation.unsynced()
      |> Core.Repo.exists?())
  end

  @doc """
  Determines if a cluster has any locked installation
  """
  @spec locked?(Cluster.t) :: boolean
  def locked?(%Cluster{owner_id: uid}) do
    Installation.for_user(uid)
    |> Installation.locks()
    |> Core.Repo.exists?()
  end

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
  Saves a usage record for a given cluster
  """
  @spec save_usage(map, Cluster.t) :: {:ok, ClusterUsageHistory.t} | error
  def save_usage(%{} = attrs, %Cluster{id: id, account_id: account_id}) do
    start_transaction()
    |> add_operation(:usage, fn _ ->
      %ClusterUsageHistory{cluster_id: id, account_id: account_id}
      |> ClusterUsageHistory.changeset(attrs)
      |> Core.Repo.insert()
    end)
    |> add_operation(:cluster, fn
      %{usage: %ClusterUsageHistory{services: svcs, clusters: cls}} when is_integer(svcs) and svcs > 0 ->
        get_cluster!(id)
        |> Cluster.changeset(%{service_count: svcs, cluster_count: cls})
        |> Core.Repo.update()
      _ -> {:ok, nil}
    end)
    |> execute(extract: :usage)
  end
  def save_usage(nil, %Cluster{}), do: {:ok, nil}

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
  Upserts a cluster by provider, name
  """
  @spec upsert_cluster(map, atom, binary, User.t) :: cluster_resp
  def upsert_cluster(attrs, provider, name, %User{id: uid} = user) do
    case get_cluster(uid, provider, name) do
      %Cluster{} = c ->
        Cluster.changeset(c, Map.merge(attrs, %{provider: provider, name: name, owner_id: uid}))
        |> Core.Repo.update()
      _ -> create_cluster(Map.merge(attrs, %{name: name, provider: provider}), user)
    end
  end

  @doc """
  Pings a cluster and saves usage.  Also meters the ingest if applicable
  """
  @spec ping_cluster(%{cluster: map, usage: map}, User.t) :: cluster_resp
  def ping_cluster(%{cluster: %{provider: p, name: n} = cluster} = attrs, %User{} = user) do
    start_transaction()
    |> add_operation(:cluster, fn _ ->
      Map.put(cluster, :pinged_at, DateTime.utc_now())
      |> upsert_cluster(p, n, user)
    end)
    |> add_operation(:usage, fn %{cluster: cluster} -> save_usage(attrs[:usage], cluster) end)
    |> add_operation(:meter, fn _ ->
      case attrs[:usage] do
        %{bytes_ingested: bytes} when is_integer(bytes) and bytes > 0 ->
          Logger.info("Deferring ingest metering for #{bytes} bytes for user #{user.email}")
          Core.Services.Payments.defer_ingest(user, bytes)
          {:ok, %{}}
        _ -> {:ok, %{}}
      end
    end)
    |> execute(extract: :cluster)
  end

  @doc """
  creates a cluster record from an upgrade queue.  Also ties the cluster back onto that queue
  """
  @spec create_from_queue(UpgradeQueue.t) :: cluster_resp
  def create_from_queue(%UpgradeQueue{name: n, provider: p, git: g, domain: d, pinged_at: pinged} = q) do
    %{user: user} = Core.Repo.preload(q, [:user])

    start_transaction()
    |> add_operation(:cluster, fn _ ->
      upsert_cluster(%{
        console_url: d,
        domain: infer_domain(d),
        legacy: q.legacy,
        git_url: g,
        pinged_at: pinged,
      }, p, n, user)
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
  Tear down all promotions for an account (for use after a trial)
  """
  @spec disable_promotions(binary) :: {:ok, term} | error
  def disable_promotions(account_id) do
    start_transaction()
    |> add_operation(:delete, fn _ ->
      ClusterDependency.for_account(account_id)
      |> Core.Repo.delete_all()
      |> ok()
    end)
    |> add_operation(:waterline, fn _ ->
      User.for_account(account_id)
      |> User.with_waterline()
      |> Core.Repo.update_all(set: [upgrade_to: nil])
      |> ok()
    end)
    |> execute(extract: :waterline)
  end

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
      |> add_operation(:check, fn _ ->
        case Core.Repo.get_by(ClusterDependency, dependency_id: dest.id, cluster_id: source.id) do
          nil -> {:ok, :pass}
          _ -> {:error, "the destination cluster is already a dependency of the source cluster"}
        end
      end)
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
  Deletes a cluster dependency.  It will recompute the promotion waterline for a user as a result, and if
  that was the last dependency, entirely disable promotions in the process
  """
  @spec delete_dependency(Cluster.t, Cluster.t, User.t) :: cluster_dep_resp
  def delete_dependency(%Cluster{provider: p} = source, %Cluster{provider: p} = dest, %User{} = user) do
    with {:ok, %{owner: dest_owner} = dest} <- authorize(dest, user) do
      start_transaction()
      |> add_operation(:delete, fn _ ->
        Core.Repo.get_by!(ClusterDependency, dependency_id: source.id, cluster_id: dest.id)
        |> Core.Repo.delete()
      end)
      |> add_operation(:waterline, fn _ ->
        line = waterline(dest_owner)
        Ecto.Changeset.change(dest_owner, %{upgrade_to: line})
        |> Core.Repo.update()
      end)
      |> add_operation(:kick, fn _ -> Core.Services.Upgrades.kick(dest_owner) end)
      |> execute(extract: :delete)
    end
  end

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
    |> notify(:promote)
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
  def delete_cluster(name, provider, %User{id: user_id}) do
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

  defp notify({:ok, %User{} = user}, :promote), do: handle_notify(PubSub.UpgradesPromoted, user)
  defp notify({:ok, %ClusterDependency{} = dep}, :create, user),
    do: handle_notify(PubSub.ClusterDependencyCreated, dep, actor: user)
  defp notify(error, _, _), do: error
end
