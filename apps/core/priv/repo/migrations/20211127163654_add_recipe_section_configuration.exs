defmodule Core.Repo.Migrations.AddRecipeSectionConfiguration do
  use Ecto.Migration

  def change do
    alter table(:recipe_sections) do
      add :configuration, :map
    end
  end
end
