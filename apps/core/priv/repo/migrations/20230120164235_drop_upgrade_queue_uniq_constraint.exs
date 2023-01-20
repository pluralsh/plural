defmodule Core.Repo.Migrations.DropUpgradeQueueUniqConstraint do
  use Ecto.Migration

  def change do
    drop index(:upgrade_queues, [:cluster_id])
    create index(:upgrade_queues, [:cluster_id])
  end
end
