defmodule Core.Schema.Publisher do
  use Piazza.Ecto.Schema
  alias Core.Schema.User

  schema "publishers" do
    field :name, :string

    belongs_to :owner, User

    timestamps()
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(p in query, order_by: ^order)

  @valid ~w(name owner_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:name, :owner_id])
    |> foreign_key_constraint(:owner_id)
    |> unique_constraint(:name)
    |> validate_length(:name, max: 255)
  end
end