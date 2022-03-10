defmodule Core.Repo.Migrations.AddRecipeTest do
  use Ecto.Migration

  def change do
    alter table(:recipes) do
      add :tests, :map
    end
  end
end
