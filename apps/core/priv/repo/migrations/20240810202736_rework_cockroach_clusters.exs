defmodule Core.Repo.Migrations.ReworkCockroachClusters do
  use Ecto.Migration

  def change do
    rename table(:cockroach_clusters), to: table(:postgres_clusters)

    alter table(:postgres_clusters) do
      add :host, :string
    end

    rename table(:console_instances), :cockroach_id, to: :postgres_id
  end
end
