defmodule GraphQl.Resolvers.Cluster do
  use GraphQl.Resolvers.Base, model: Core.Schema.Cluster
  alias Core.Services.Clusters

  def query(_, _), do: Cluster

  def resolve_cluster(%{id: id}, %{context: %{current_user: user}}),
    do: Clusters.authorize(id, user)

  def list_clusters(args, %{context: %{current_user: user}}) do
    Cluster.for_user(user)
    |> Cluster.ordered()
    |> paginate(args)
  end

  def create_cluster(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Clusters.create_cluster(attrs, user)

  def delete_cluster(%{name: n, provider: p}, %{context: %{current_user: user}}),
    do: Clusters.delete_cluster(n, p, user)
end
