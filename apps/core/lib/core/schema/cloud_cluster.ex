defmodule Core.Schema.CloudCluster do
  use Piazza.Ecto.Schema

  defenum Cloud, aws: 0

  @saturation 1000

  @region_map %{
    aws: ~w(us-east-1)
  }

  schema "cloud_clusters" do
    field :name,        :string
    field :external_id, :binary_id
    field :cloud,       Cloud
    field :region,      :string
    field :count,       :integer

    timestamps()
  end

  def for_cloud(query \\ __MODULE__, cloud) do
    from(c in query, where: c.cloud == ^cloud)
  end

  def unsaturated(query \\ __MODULE__) do
    from(c in query, where: c.count < @saturation)
  end

  def for_region(query \\ __MODULE__, region) do
    from(c in query, where: c.region == ^region)
  end

  def region_information(), do: @region_map

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, ~w(name external_id cloud region)a)
    |> unique_constraint(:name)
    |> validate_required(~w(name external_id cloud region)a)
  end
end
