defmodule Core.Repo.Migrations.AddClusterUsage do
  use Ecto.Migration

  def change do
    create table(:cluster_usage_history, primary_key: false) do
      add :id,         :uuid, primary_key: true
      add :cluster_id, :uuid
      add :account_id, :uuid
      add :memory,     :bigint
      add :cpu,        :bigint

      timestamps()
    end
  end
end
