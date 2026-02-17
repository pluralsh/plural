defmodule Core.Schema.PlatformPlan do
  use Piazza.Ecto.Schema

  defenum Period, monthly: 0, yearly: 1
  defenum Dimension, user: 0, cluster: 1

  defmodule LineItem do
    use Piazza.Ecto.Schema
    alias Core.Schema.PlatformPlan.{Period, Dimension}

    embedded_schema do
      field :name,        :string
      field :dimension,   Dimension
      field :external_id, :string
      field :cost,        :integer
      field :period,      Period
    end

    @valid ~w(name cost period dimension external_id)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required([:name, :cost, :period, :dimension])
    end
  end

  schema "platform_plans" do
    field :name,         :string
    field :visible,      :boolean, default: true
    field :trial,        :boolean, default: false
    field :enterprise,   :boolean
    field :cost,         :integer
    field :period,       Period
    field :external_id,  :string
    field :service_plan, :string
    field :cluster_plan, :string

    field :base_price_id,         :string
    field :metered_price_id,      :string
    field :ingest_meter_price_id, :string

    field :maximum_users,    :integer
    field :maximum_clusters, :integer

    embeds_one :features, Features, on_replace: :update do
      boolean_fields [:vpn, :user_management, :audit, :multi_cluster, :database_management, :cd]
    end

    embeds_many :line_items, LineItem, on_replace: :delete

    timestamps()
  end

  def for_name(query \\ __MODULE__, name), do: from(p in query, where: p.name == ^name)

  def visible(query \\ __MODULE__), do: from(p in query, where: p.visible)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(p in query, order_by: ^order)

  def enterprise(query \\ __MODULE__) do
    from(p in query, where: p.enterprise)
  end

  def self_serve(query \\ __MODULE__) do
    from(p in query, where: not p.enterprise or is_nil(p.enterprise))
  end

  def features(), do: __MODULE__.Features.__schema__(:fields) -- [:id]

  @valid ~w(
    name
    visible
    cost
    period
    external_id
    trial
    service_plan
    cluster_plan
    base_price_id
    metered_price_id
    ingest_meter_price_id
    maximum_users
    maximum_clusters
  )a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> cast_embed(:line_items)
    |> cast_embed(:features, with: &features_changeset/2)
    |> validate_required([:name, :visible])
  end

  def price_changeset(schema, attrs) do
    schema
    |> cast(attrs, [:base_price_id, :metered_price_id, :ingest_meter_price_id])
    |> validate_required([:base_price_id, :metered_price_id, :ingest_meter_price_id])
  end

  def features_changeset(model, attrs) do
    model
    |> cast(attrs, features())
  end

  defimpl Jason.Encoder, for: Core.Schema.PlatformPlan.Features do
    def encode(features, opts) do
      features
      |> Map.from_struct()
      |> Map.take(Core.Schema.PlatformPlan.features())
      |> Jason.encode(opts)
    end
  end
end
