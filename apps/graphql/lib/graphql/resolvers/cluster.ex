defmodule GraphQl.Resolvers.Cluster do
  use GraphQl.Resolvers.Base, model: Core.Schema.Cluster
  alias Core.Services.Clusters
  alias Core.Schema.{DeferredUpdate, ClusterDependency}

  def query(ClusterDependency, _), do: ClusterDependency
  def query(_, _), do: Cluster

  def resolve_cluster(%{id: id}, %{context: %{current_user: user}}),
    do: Clusters.authorize(id, user)

  def list_clusters(args, %{context: %{current_user: user}}) do
    Cluster.for_user(user)
    |> Cluster.ordered()
    |> paginate(args)
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

  def promote(_, %{context: %{current_user: user}}), do: Clusters.promote(user)

  def create_cluster(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Clusters.create_cluster(attrs, user)

  def delete_cluster(%{name: n, provider: p}, %{context: %{current_user: user}}),
    do: Clusters.delete_cluster(n, p, user)

  def transfer_ownership(%{name: n, email: e}, %{context: %{current_user: user}}),
    do: Clusters.transfer_ownership(n, e, user)
end
