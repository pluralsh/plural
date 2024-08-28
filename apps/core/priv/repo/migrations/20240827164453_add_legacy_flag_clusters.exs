defmodule Core.Repo.Migrations.AddLegacyFlagClusters do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :legacy, :boolean, default: true
    end

    alter table(:upgrade_queues) do
      add :legacy, :boolean, default: true
    end
  end
end
