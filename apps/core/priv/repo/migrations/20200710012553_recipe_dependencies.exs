defmodule Core.Repo.Migrations.RecipeDependencies do
  use Ecto.Migration

  def change do
    create table(:recipe_dependencies, primary_key: false) do
      add :id,                  :uuid, primary_key: true
      add :index,               :integer
      add :recipe_id,           references(:recipes, type: :uuid, on_delete: :delete_all)
      add :dependent_recipe_id, references(:recipes, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:recipe_dependencies, [:recipe_id, :dependent_recipe_id])
  end
end
