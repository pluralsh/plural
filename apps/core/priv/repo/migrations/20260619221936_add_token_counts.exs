defmodule Core.Repo.Migrations.AddTokenCounts do
  use Ecto.Migration

  def change do
    alter table(:cluster_usage_history) do
      add :tokens, :bigint, default: 0
    end
  end
end
