defmodule Core.Schema.Dashboard do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository}

  schema "dashboards" do
    field :name, :string
    field :uid,  :string

    belongs_to :repository, Repository

    timestamps()
  end

  @valid ~w(name uid)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:uid)
    |> validate_required([:name, :uid])
  end
end