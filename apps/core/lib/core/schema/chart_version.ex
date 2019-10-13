defmodule Core.Schema.Version do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Chart}

  schema "versions" do
    field :version, :string
    field :helm, :map
    belongs_to :chart, Chart

    timestamps()
  end

  @valid ~w(version chart_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:version, :chart_id])
    |> unique_constraint(:version, name: index_name(:charts, [:chart_id, :version]))
    |> foreign_key_constraint(:chart_id)
  end
end