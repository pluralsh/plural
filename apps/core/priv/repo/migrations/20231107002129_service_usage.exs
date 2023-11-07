defmodule Core.Repo.Migrations.ServiceUsage do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :service_count, :integer, default: 0
    end

    alter table(:cluster_usage_history) do
      add :services, :integer, default: 0
    end
  end
end
