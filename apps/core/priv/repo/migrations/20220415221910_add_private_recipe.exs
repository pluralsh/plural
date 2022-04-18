defmodule Core.Repo.Migrations.AddPrivateRecipe do
  use Ecto.Migration

  def change do
    alter table(:recipes) do
      add :private, :boolean, default: false
    end
  end
end
