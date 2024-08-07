defmodule Core.Schema.CockroachCluster do
  use Piazza.Ecto.Schema
  alias Piazza.Ecto.EncryptedString
  alias Core.Schema.CloudCluster

  @saturation 1000

  schema "cockroach_clusters" do
    field :name,        :string
    field :cloud,       CloudCluster.Cloud
    field :region,      :string
    field :url,         EncryptedString
    field :certificate, :string
    field :endpoints,   :map
    field :count,       :integer, default: 0

    timestamps()
  end

  def for_cloud(query \\ __MODULE__ , cloud) do
    from(c in query, where: c.cloud == ^cloud)
  end

  def unsaturated(query \\ __MODULE__) do
    from(c in query, where: c.count < @saturation)
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, ~w(name cloud region url certificate endpoints)a)
    |> unique_constraint(:name)
    |> validate_required(~w(name cloud region url certificate endpoints)a)
  end
end
