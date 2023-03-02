defmodule Core.Schema.ClusterDependency do
  use Piazza.Ecto.Schema
  alias Core.Schema.Cluster

  schema "cluster_dependencies" do
    belongs_to :cluster,    Cluster
    belongs_to :dependency, Cluster

    timestamps()
  end

  def for_cluster(query \\ __MODULE__, id) do
    from(d in query, where: d.cluster_id == ^id)
  end

  def waterline(query \\ __MODULE__, user_id) do
    from(cd in query,
      join: c in assoc(cd, :cluster),
      join: d in assoc(cd, :dependency),
      join: u in assoc(d, :owner),
      where: c.owner_id == ^user_id and not is_nil(u.upgrade_to),
      select: min(u.upgrade_to)
    )
  end

  def for_user(query \\ __MODULE__, user_id) do
    clusters = Cluster.for_user(user_id)
    from(d in query,
      join: c in subquery(clusters),
        on: c.id == d.cluster_id
    )
  end

  @valid ~w(cluster_id dependency_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:cluster_id)
    |> foreign_key_constraint(:cluster_id)
    |> foreign_key_constraint(:dependency_id)
    |> validate_required(@valid)
  end
end
