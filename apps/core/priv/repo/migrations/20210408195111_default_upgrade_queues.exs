defmodule Core.Repo.Migrations.DefaultUpgradeQueues do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :default_queue_id, references(:upgrade_queues, type: :uuid, on_delete: :delete_all)
    end

    alter table(:upgrade_queues) do
      add :pinged_at, :utc_datetime_usec
    end
  end
end
