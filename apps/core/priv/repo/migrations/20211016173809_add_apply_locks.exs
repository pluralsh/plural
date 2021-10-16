defmodule Core.Repo.Migrations.AddApplyLocks do
  use Ecto.Migration

  def change do
    create table(:apply_locks, primary_key: false) do
      add :id,            :uuid, primary_key: true
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :lock,          :binary
      add :owner_id,      references(:users, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:apply_locks, [:repository_id])
  end
end
