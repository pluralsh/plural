defmodule Core.Schema.StackRecipe do
  use Piazza.Ecto.Schema
  alias Core.Schema.{StackCollection, Recipe}

  schema "collection_recipes" do
    field :index, :integer

    belongs_to :collection,  StackCollection
    belongs_to :recipe,      Recipe

    timestamps()
  end

  @valid ~w(recipe_id index collection_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:collection_id, name: index_name(:collection_recipes, [:collection_id, :recipe_id]))
    |> foreign_key_constraint(:recipe_id)
    |> foreign_key_constraint(:collection_id)
    |> validate_required([:index])
  end
end
