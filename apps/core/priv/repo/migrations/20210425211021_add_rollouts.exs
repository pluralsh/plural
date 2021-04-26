defmodule Core.Repo.Migrations.AddRollouts do
  use Ecto.Migration

  def change do
    create table(:rollouts, primary_key: false) do
      add :id,            :uuid, primary_key: true
      add :status,        :integer
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :event,         :binary
      add :cursor,        :uuid
      add :heartbeat,     :utc_datetime_usec
      add :count,         :integer, default: 0

      timestamps()
    end

    create index(:rollouts, [:repository_id])
    create index(:rollouts, [:repository_id, :id])
    create index(:rollouts, [:status])
    create index(:rollouts, [:heartbeat])
  end
end
