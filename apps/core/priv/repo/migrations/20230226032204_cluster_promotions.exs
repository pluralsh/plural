defmodule Core.Repo.Migrations.ClusterPromotions do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :upgrade_to, :uuid
    end

    alter table(:deferred_updates) do
      add :pending, :boolean
    end

    create table(:cluster_dependencies, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :cluster_id, references(:clusters, type: :uuid, on_delete: :delete_all)
      add :dependency_id, references(:clusters, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:cluster_dependencies, [:cluster_id])
    create index(:cluster_dependencies, [:dependency_id])
  end
end
