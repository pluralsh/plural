defmodule Core.Schema.Repository do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Publisher}

  schema "repositories" do
    field :name, :string, null: false
    belongs_to :publisher, Publisher

    timestamps()
  end

  @valid ~w(name publisher_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:publisher_id)
    |> unique_constraint(:name)
  end
end