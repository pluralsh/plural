defmodule Core.Repo.Migrations.RestrictedRecipes do
  use Ecto.Migration

  def change do
    alter table(:recipes) do
      add :restricted, :boolean, default: false
    end
  end
end
