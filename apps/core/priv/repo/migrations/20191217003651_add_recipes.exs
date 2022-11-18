defmodule Core.Repo.Migrations.AddRecipes do
  use Ecto.Migration

  def change do
    create table(:recipes, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :name,        :string
      add :description, :string
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:recipes, [:repository_id])
    create unique_index(:recipes, [:repository_id, :name])

    create table(:recipe_sections, primary_key: false) do
      add :id,            :uuid, primary_key: true
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :recipe_id,     references(:recipes, type: :uuid, on_delete: :delete_all)
      add :index,         :integer, default: 0

      timestamps()
    end

    create index(:recipe_sections, [:recipe_id])
    create index(:recipe_sections, [:repository_id])
    create unique_index(:recipe_sections, [:repository_id, :recipe_id])

    create table(:recipe_items, primary_key: false) do
      add :id,                :uuid, primary_key: true
      add :recipe_section_id, references(:recipe_sections, type: :uuid, on_delete: :delete_all)
      add :terraform_id,      references(:terraform, type: :uuid, on_delete: :delete_all)
      add :chart_id,          references(:charts, type: :uuid, on_delete: :delete_all)
      add :configuration,     :map

      timestamps()
    end

    create index(:recipe_items, [:recipe_section_id])
    create unique_index(:recipe_items, [:recipe_section_id, :terraform_id])
    create unique_index(:recipe_items, [:recipe_section_id, :chart_id])
  end
end
