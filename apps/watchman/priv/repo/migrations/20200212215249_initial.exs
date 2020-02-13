defmodule Watchman.Repo.Migrations.Initial do
  use Ecto.Migration

  def change do
    create table(:builds, primary_key: false) do
      add :id,           :uuid, primary_key: true
      add :repository,   :string, null: false
      add :type,         :integer
      add :status,       :integer
      add :completed_at, :utc_datetime_usec

      timestamps()
    end

    create index(:builds, [:inserted_at])
    create index(:builds, [:repository])
  end
end
