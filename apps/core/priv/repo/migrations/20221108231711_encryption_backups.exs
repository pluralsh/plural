defmodule Core.Repo.Migrations.EncryptionBackups do
  use Ecto.Migration

  def change do
    create table(:key_backups, primary_key: false) do
      add :id,           :uuid, primary_key: true
      add :name,         :string, nil: false
      add :repositories, {:array, :string}
      add :vault_path,   :string

      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:key_backups, [:user_id, :name])
    create index(:key_backups, [:user_id])
    create unique_index(:key_backups, [:vault_path])
  end
end
