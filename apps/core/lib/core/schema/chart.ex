defmodule Core.Schema.Chart do
  use Core.DB.Schema
  alias Core.Schema.{Publisher}

  schema "charts" do
    field :name,           :string
    field :latest_version, :string

    belongs_to :publisher, Publisher

    timestamps()
  end

  @valid ~w(name latest_version publisher_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:name)
    |> foreign_key_constraint(:publisher_id)
    |> validate_required([:name, :latest_version])
    |> validate_length(:name, max: 255)
  end
end