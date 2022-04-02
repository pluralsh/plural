defmodule Core.Schema.TestStep do
  use Piazza.Ecto.Schema
  alias Core.Schema.Test

  schema "test_steps" do
    field :name,        :string
    field :description, :string
    field :status,      Test.Status
    field :logs,        :string

    belongs_to :test, Test

    timestamps()
  end

  @valid ~w(name logs status description)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:name, :status, :description])
    |> foreign_key_constraint(:test_id)
  end
end
