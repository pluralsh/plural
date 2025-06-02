defmodule Core.Repo.Migrations.AddClustersUsage do
  use Ecto.Migration

  def change do
    alter table(:cluster_usage_history) do
      add :clusters, :integer
    end

    alter table(:clusters) do
      add :cluster_count, :integer
    end

    alter table(:platform_plans) do
      add :cluster_plan, :string
    end
  end
end
