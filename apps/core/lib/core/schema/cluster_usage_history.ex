defmodule Core.Schema.ClusterUsageHistory do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account, Cluster}

  schema "cluster_usage_history" do
    field :cpu,    :integer
    field :memory, :integer

    belongs_to :cluster, Cluster
    belongs_to :account, Account

    timestamps()
  end

  def inserted_after(query \\ __MODULE__, dt) do
    from(u in query, where: u.inserted_at >= ^dt)
  end

  def for_cluster(query \\ __MODULE__, cluster_id) do
    from(u in query, where: u.cluster_id == ^cluster_id)
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(u in query, where: u.account_id == ^account_id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :inserted_at]) do
    from(u in query, order_by: ^order)
  end

  @valid ~w(cpu memory cluster_id account_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:account_id)
    |> validate_required([:account_id, :cluster_id])
  end
end
