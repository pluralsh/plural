defmodule Core.Repo.Migrations.AddRecipePrimary do
  use Ecto.Migration

  def change do
    alter table(:recipes) do
      add :primary, :boolean, default: false
    end
  end
end
