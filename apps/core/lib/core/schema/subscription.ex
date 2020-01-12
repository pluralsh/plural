defmodule Core.Schema.Subscription do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Installation, Plan}
  schema "subscriptions" do
    field :external_id, :string
    field :customer_id, :string

    belongs_to :installation, Installation
    belongs_to :plan,         Plan

    timestamps()
  end

  @valid ~w(installation_id plan_id)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> validate_required([:installation_id, :plan_id])
    |> foreign_key_constraint(:installation_id)
    |> foreign_key_constraint(:plan_id)
  end

  @stripe_valid ~w(external_id customer_id)a

  def stripe_changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @stripe_valid)
    |> unique_constraint(:installation_id)
    |> unique_constraint(:external_id)
  end
end