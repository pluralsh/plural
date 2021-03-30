defmodule Core.Repo.Migrations.AddUpgradeQueues do
  use Ecto.Migration

  def change do
    create table(:upgrade_queues, primary_key: false) do
      add :id,       :uuid, primary_key: true
      add :user_id,  references(:users, type: :uuid, on_delete: :delete_all)
      add :acked,    :uuid

      timestamps()
    end

    create index(:upgrade_queues, [:user_id])

    create table(:upgrades, primary_key: false) do
      add :id,            :uuid, primary_key: true
      add :queue_id,      references(:upgrade_queues, type: :uuid, on_delete: :delete_all)
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :type,          :integer
      add :message,       :string

      timestamps()
    end

    create index(:upgrades, [:queue_id])
    create index(:upgrades, [:repository_id])
  end
end
