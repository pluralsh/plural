defmodule Core.Repo.Migrations.AddRecipeProvider do
  use Ecto.Migration

  def change do
    alter table(:recipes) do
      add :provider, :integer
    end
  end
end
