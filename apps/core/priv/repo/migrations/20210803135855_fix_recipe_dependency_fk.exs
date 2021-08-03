defmodule Core.Repo.Migrations.FixRecipeDependencyFk do
  use Ecto.Migration

  def change do
    execute "ALTER TABLE recipe_dependencies DROP CONSTRAINT recipe_dependencies_dependent_recipe_id_fkey"
  end
end
