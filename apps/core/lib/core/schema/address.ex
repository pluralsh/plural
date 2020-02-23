defmodule Core.Schema.Address do
  use Piazza.Ecto.Schema

  embedded_schema do
    field :line1,   :string
    field :line2,   :string
    field :city,    :string
    field :state,   :string
    field :country, :string
    field :zip,     :string
  end

  @valid ~w(line1 line2 city state country zip)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:line1, :city, :state, :country, :zip])
  end
end