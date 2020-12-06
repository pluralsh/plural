defmodule Core.Schema.Account do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User}

  schema "accounts" do
    field :name, :string
    field :billing_customer_id, :string
    belongs_to :root_user, User

    timestamps()
  end

  @valid ~w(name)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:name)
    |> validate_required([:name])
  end

  @payment ~w(billing_customer_id)a

  def payment_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @payment)
  end
end