defmodule Core.Schema.Plan do
  use Piazza.Ecto.Schema

  defenum Period, monthly: 0, yearly: 1
  defenum Type, licensed: 0, metered: 1

  defmodule LineItem do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :name,        :string
      field :dimension,   :string
      field :external_id, :string
      field :cost,        :integer
      field :period,      Core.Schema.Plan.Period
      field :type,        Type, default: :licensed
    end

    @valid ~w(name cost period dimension external_id type)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required([:name, :cost, :period, :dimension])
    end
  end

  defmodule Limit do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :dimension, :string
      field :quantity,  :integer, default: 0
    end

    @valid ~w(dimension quantity)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required([:dimension, :quantity])
    end
  end

  defmodule LineItems do
    use Piazza.Ecto.Schema
    alias Core.Schema.Plan

    embedded_schema do
      embeds_many :included, Plan.Limit
      embeds_many :items,    Plan.LineItem
    end

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, [])
      |> cast_embed(:included)
      |> cast_embed(:items)
    end
  end

  defmodule Feature do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :name,        :string
      field :description, :string
    end

    @valid ~w(name description)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required([:name, :description])
    end
  end

  defmodule Metadata do
    use Piazza.Ecto.Schema
    alias Core.Schema.Plan

    embedded_schema do
      field :freeform, :map
      embeds_many :features, Plan.Feature
    end

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, [:freeform])
      |> cast_embed(:features)
    end
  end

  defmodule ServiceLevel do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :min_severity,  :integer
      field :max_severity,  :integer
      field :response_time, :integer
    end

    @valid ~w(min_severity max_severity response_time)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required(@valid)
    end
  end

  schema "plans" do
    field :name,        :string
    field :default,     :boolean
    field :visible,     :boolean, default: true
    field :cost,        :integer
    field :period,      Period
    field :external_id, :string

    embeds_one  :metadata,       Metadata, on_replace: :update
    embeds_one  :line_items,     LineItems, on_replace: :update
    embeds_many :service_levels, ServiceLevel, on_replace: :delete

    belongs_to  :repository, Core.Schema.Repository

    timestamps()
  end

  @valid ~w(name default visible cost period external_id)a

  def for_repository(query \\ __MODULE__, repo_id),
    do: from(p in query, where: p.repository_id == ^repo_id)

  def ordered(query \\ __MODULE__, order \\ [asc: :cost]),
    do: from(p in query, order_by: ^order)

  def features(%__MODULE__{metadata: %{features: features}}),
    do: Enum.map(features, & %{name: &1.name, description: &1.description})
  def features(_), do: []

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> cast_embed(:line_items)
    |> cast_embed(:metadata)
    |> cast_embed(:service_levels)
    |> validate_required([:name, :visible])
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:name, name: index_name(:plans, [:repository_id, :name]))
  end

  def update_changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, [:default])
    |> cast_embed(:service_levels)
  end
end
