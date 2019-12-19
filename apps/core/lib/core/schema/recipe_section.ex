defmodule Core.Schema.RecipeSection do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, Recipe, RecipeItem}

  schema "recipe_sections" do
    field :index, :integer

    belongs_to :repository, Repository
    belongs_to :recipe, Recipe
    has_many :recipe_items, RecipeItem

    timestamps()
  end

  @valid ~w(index repository_id recipe_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:repository_id)
    |> foreign_key_constraint(:recipe_id)
    |> unique_constraint(:repository_id, name: index_name(:recipe_sections, [:repository_id, :recipe_id]))
    |> validate_required([:index, :repository_id, :recipe_id])
  end
end