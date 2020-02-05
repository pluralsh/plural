defmodule Core.Schema.Subscription do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Installation, Plan}

  defmodule LineItem do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :dimension,   :string
      field :quantity,    :integer
      field :external_id, :string
    end

    @valid ~w(dimension quantity external_id)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required([:dimension, :quantity])
    end
  end

  defmodule LineItems do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :item_id, :string
      embeds_many :items, Core.Schema.Subscription.LineItem, on_replace: :delete
    end

    @valid ~w(item_id)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> cast_embed(:items)
    end
  end

  schema "subscriptions" do
    field :external_id, :string
    field :customer_id, :string

    embeds_one :line_items,   LineItems, on_replace: :update
    belongs_to :installation, Installation
    belongs_to :plan,         Plan

    timestamps()
  end

  @valid ~w(installation_id plan_id)a

  def for_user(query \\ __MODULE__, user_id) do
    from(s in query,
      join: i in ^Installation.for_user(user_id),
      where: s.installation_id == i.id
    )
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(s in query, order_by: ^order)
  end

  def dimension(
    %__MODULE__{plan: %Plan{line_items: %{included: included}}, line_items: %LineItems{items: items}},
    dim
  ) do
    with %{quantity: quantity} <- Enum.find(items, & &1.dimension == dim),
         %{quantity: included} <- Enum.find(included, & &1.dimension == dim) do
      quantity + (included || 0)
    else
      _ -> 0
    end
  end

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> cast_embed(:line_items)
    |> validate_required([:installation_id, :plan_id])
    |> foreign_key_constraint(:installation_id)
    |> foreign_key_constraint(:plan_id)
  end

  @stripe_valid ~w(external_id customer_id)a

  def stripe_changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @stripe_valid)
    |> cast_embed(:line_items)
    |> unique_constraint(:installation_id)
    |> unique_constraint(:external_id)
  end
end