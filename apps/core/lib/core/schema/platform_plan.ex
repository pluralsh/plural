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
    field :name,        :string
    field :visible,     :boolean, default: true
    field :cost,        :integer
    field :period,      Period
    field :external_id, :string

    embeds_one :features, Features, on_replace: :update do
      boolean_fields [:vpn, :user_management]
    end

    embeds_many :line_items, LineItem, on_replace: :delete

    timestamps()
  end

  def visible(query \\ __MODULE__), do: from(p in query, where: p.visible)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(p in query, order_by: ^order)

  def features(), do: __MODULE__.Features.__schema__(:fields) -- [:id]

  @valid ~w(name visible cost period external_id)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> cast_embed(:line_items)
    |> cast_embed(:features, with: &features_changeset/2)
    |> validate_required([:name, :visible])
  end

  def features_changeset(model, attrs) do
    model
    |> cast(attrs, features())
  end
end
