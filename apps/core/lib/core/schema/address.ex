defmodule Core.Schema.Address do
  use Piazza.Ecto.Schema

  embedded_schema do
    field :name,    :string
    field :line1,   :string
    field :line2,   :string
    field :city,    :string
    field :state,   :string
    field :country, :string
    field :zip,     :string
  end

  def to_stripe(%__MODULE__{} = address) do
    Map.take(address, ~w(line1 line2 city state country)a)
    |> Map.put(:postal_code, address.zip)
  end

  @valid ~w(line1 line2 city state country zip name)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:line1, :city, :state, :country, :zip])
  end
end
