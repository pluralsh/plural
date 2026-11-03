defmodule GraphQl.Resolvers.Cluster do
  use GraphQl.Resolvers.Base, model: Core.Schema.Cluster
  alias Core.Services.{Clusters, Repositories}
  alias Core.Schema.{DeferredUpdate, ClusterDependency, ClusterUsageHistory, OIDCProvider}

  def query(ClusterDependency, _), do: ClusterDependency
  def query(_, _), do: Cluster

  def resolve_cluster(%{id: id}, %{context: %{current_user: user}}),
    do: Clusters.authorize(id, user)

  def list_clusters(args, %{context: %{current_user: user}}) do
    Cluster.for_user(user)
    |> Cluster.active()
    |> Cluster.ordered()
    |> paginate(args)
  end

  def synced(cluster), do: {:ok, Clusters.synced?(cluster)}

  def locked(cluster), do: {:ok, Clusters.locked?(cluster)}

  def usage_history(cluster, begin) do
    ClusterUsageHistory.for_cluster(cluster.id)
    |> ClusterUsageHistory.ordered()
    |> ClusterUsageHistory.inserted_after(begin)
    |> Core.Repo.all()
    |> ok()
  end

  def create_dependency(%{source_id: sid, dest_id: did}, %{context: %{current_user: user}}) do
    source = Clusters.get_cluster!(sid)
    dest   = Clusters.get_cluster!(did)
    Clusters.create_dependency(source, dest, user)
  end

  def delete_dependency(%{source_id: sid, dest_id: did}, %{context: %{current_user: user}}) do
    source = Clusters.get_cluster!(sid)
    dest   = Clusters.get_cluster!(did)
    Clusters.delete_dependency(source, dest, user)
  end

  def upgrade_info(%Cluster{owner_id: uid}) do
    DeferredUpdate.for_user(uid)
    |> DeferredUpdate.pending()
    |> DeferredUpdate.info()
    |> Core.Repo.all()
    |> ok()
  end

  def installation(cluster, %{repository: name}, %{context: %{current_user: user}}) do
    with {:ok, %{owner_id: owner_id}} <- Clusters.authorize(cluster, user) do
      case Repositories.get_repository_by_name(name) do
        %{id: repo_id} -> {:ok, Repositories.get_installation(owner_id, repo_id)}
        nil -> {:ok, nil}
      end
    end
  end

  def oidc_providers(cluster, args, %{context: %{current_user: user}}) do
    with {:ok, %{owner_id: owner_id}} <- Clusters.authorize(cluster, user) do
      OIDCProvider.for_owner(owner_id)
      |> OIDCProvider.ordered()
      |> paginate(args)
    end
  end

  def promote(%{cluster_id: id}, %{context: %{current_user: user}}) when is_binary(id) do
    with {:ok, %{owner: owner}} <- Clusters.authorize(id, user),
      do: Clusters.promote(owner)
  end
  def promote(_, %{context: %{current_user: user}}), do: Clusters.promote(user)

  def create_cluster(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Clusters.create_cluster(attrs, user)

  def delete_cluster(%{name: n, provider: p}, %{context: %{current_user: user}}),
    do: Clusters.delete_cluster(n, p, user)

  def transfer_ownership(%{name: n, email: e}, %{context: %{current_user: user}}),
    do: Clusters.transfer_ownership(n, e, user)

  def ping_cluster(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Clusters.ping_cluster(attrs, user)
end
