defmodule Core.Repo.Migrations.AddByteIngestHistory do
  use Ecto.Migration

  def change do
    alter table(:cluster_usage_history) do
      add :bytes_ingested, :integer
    end
  end
end
