defmodule Core.Schema.PlatformSubscription do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account, PlatformPlan}

  defmodule LineItem do
    use Piazza.Ecto.Schema
    alias Core.Schema.PlatformPlan

    embedded_schema do
      field :dimension,   PlatformPlan.Dimension
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

  schema "platform_subscriptions" do
    field :external_id, :string

    embeds_many :line_items, LineItem, on_replace: :delete
    belongs_to  :account,    Account
    belongs_to  :plan,       PlatformPlan

    timestamps()
  end

  @valid ~w(account_id plan_id)a

  def dimension(%__MODULE__{line_items: items}, dim) do
    case Enum.find(items, & &1.dimension == dim) do
      %{quantity: quantity} -> quantity
      _ -> 0
    end
  end

  def line_item(%__MODULE__{line_items: items}, dim),
    do: Enum.find(items, & &1.dimension == dim)

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> cast_embed(:line_items)
    |> validate_required([:account_id, :plan_id])
    |> foreign_key_constraint(:account_id)
    |> foreign_key_constraint(:plan_id)
    |> unique_constraint(:account_id)
  end

  @stripe_valid ~w(external_id)a

  def stripe_changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @stripe_valid)
    |> cast_embed(:line_items)
    |> unique_constraint(:account_id)
    |> unique_constraint(:external_id)
  end
end
