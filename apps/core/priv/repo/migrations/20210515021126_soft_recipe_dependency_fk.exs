defmodule Core.Repo.Migrations.SoftRecipeDependencyFk do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE recipe_dependencies DROP CONSTRAINT recipe_dependencies_dependent_recipe_id_fkey"
    alter table(:recipe_dependencies) do
      modify :dependent_recipe_id, references(:recipes, type: :uuid, on_delete: :nothing)
    end
  end

  def down do
    execute "ALTER TABLE recipe_dependencies DROP CONSTRAINT recipe_dependencies_dependent_recipe_id_fkey"

    alter table(:recipe_dependencies) do
      modify :dependent_recipe_id, references(:recipes, type: :uuid, on_delete: :delete_all)
    end
  end
end
