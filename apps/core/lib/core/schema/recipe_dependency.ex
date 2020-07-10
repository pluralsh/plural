defmodule Core.Schema.RecipeDependency do
  use Piazza.Ecto.Schema
  alias Core.Schema.Recipe

  schema "recipe_dependencies" do
    field :index, :integer
    belongs_to :recipe, Recipe
    belongs_to :dependent_recipe, Recipe

    timestamps()
  end

  @valid ~w(recipe_id index dependent_recipe_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:recipe_id, name: index_name(:recipe_dependencies, [:recipe_id, :dependent_recipe_id]))
    |> foreign_key_constraint(:recipe_id)
    |> validate_required([:index])
  end
end