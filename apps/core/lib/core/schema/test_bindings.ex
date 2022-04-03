defmodule Core.Schema.TestBinding do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Version, Test}

  schema "test_bindings" do
    belongs_to :test, Test
    belongs_to :version, Version

    timestamps()
  end

  @valid ~w(test_id version_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:version_id])
    |> foreign_key_constraint(:test_id)
    |> foreign_key_constraint(:version_id)
  end
end
