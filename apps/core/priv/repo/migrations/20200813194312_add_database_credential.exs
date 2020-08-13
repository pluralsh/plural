defmodule Core.Repo.Migrations.AddDatabaseCredential do
  use Ecto.Migration

  def change do
    alter table(:databases) do
      add :credentials, :map
    end
  end
end
