defmodule Core.Schema.PlatformSubscription do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account, PlatformPlan}

  @expiry [months: -1]

  defenum Status, open: 0, current: 1, delinquent: 2

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
    field :status,       Status
    field :external_id,  :string
    field :metered_id,   :string

    embeds_many :line_items, LineItem, on_replace: :delete
    belongs_to  :account,    Account
    belongs_to  :plan,       PlatformPlan

    timestamps()
  end

  @valid ~w(account_id plan_id)a

  def expired_trial(query \\ __MODULE__) do
    expiry = Timex.now() |> Timex.shift(@expiry)
    from(s in query,
      join: p in assoc(s, :plan),
      where: p.trial and s.inserted_at <= ^expiry
    )
  end

  def metered(query \\ __MODULE__) do
    from(s in query, where: not is_nil(s.metered_id))
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :id]) do
    from(s in query, order_by: ^order)
  end

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

  @stripe_valid ~w(external_id metered_id status)a

  def stripe_changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @stripe_valid)
    |> cast_embed(:line_items)
    |> unique_constraint(:account_id)
    |> unique_constraint(:external_id)
  end
end
