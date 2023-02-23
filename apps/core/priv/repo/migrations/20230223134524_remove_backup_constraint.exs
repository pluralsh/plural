defmodule Core.Repo.Migrations.RemoveBackupConstraint do
  use Ecto.Migration

  def change do
    drop unique_index(:key_backups, [:user_id, :digest])
  end
end
