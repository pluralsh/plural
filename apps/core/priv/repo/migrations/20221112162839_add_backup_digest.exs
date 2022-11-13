defmodule Core.Repo.Migrations.AddBackupDigest do
  use Ecto.Migration

  def change do
    alter table(:key_backups) do
      add :digest, :string
    end

    create unique_index(:key_backups, [:user_id, :digest])
  end
end
