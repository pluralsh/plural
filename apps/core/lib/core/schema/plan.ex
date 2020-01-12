defmodule Core.Schema.Plan do
  use Piazza.Ecto.Schema

  defenum Period, monthly: 0, yearly: 1

  schema "plans" do
    field :name,     :string
    field :default,  :boolean
    field :visible,  :boolean, default: true
    field :metadata, :map
    field :cost,     :integer
    field :period,   Period

    belongs_to :repository, Core.Schema.Repository

    timestamps()
  end

  @valid ~w(name default visible metadata cost period)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> validate_required([:name, :visible])
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:name, name: index_name(:plans, [:repository_id, :name]))
  end
end