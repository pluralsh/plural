defmodule Core.Repo.Migrations.AddSoftStackDependency do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE collection_recipes DROP CONSTRAINT collection_recipes_recipe_id_fkey"
    alter table(:collection_recipes) do
      modify :recipe_id, references(:recipes, type: :uuid, on_delete: :nothing)
    end
  end

  def down do
    execute "ALTER TABLE collection_recipes DROP CONSTRAINT collection_recipes_recipe_id_fkey"

    alter table(:collection_recipes) do
      modify :recipe_id, references(:recipes, type: :uuid, on_delete: :delete_all)
    end
  end
end
