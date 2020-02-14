defmodule Watchman.Repo.Migrations.AddCommands do
  use Ecto.Migration

  def change do
    create table(:commands, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :build_id, references(:builds, type: :uuid, on_delete: :delete_all)
      add :command, :string, null: false
      add :exit_code, :integer
      add :stdout, :binary
      add :completed_at, :utc_datetime_usec

      timestamps()
    end

    create index(:commands, [:build_id])
    create index(:commands, [:build_id, :inserted_at])
  end
end
