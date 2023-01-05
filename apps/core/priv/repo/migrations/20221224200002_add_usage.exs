defmodule Core.Repo.Migrations.AddUsage do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :cluster_count, :integer, default: 0
      add :usage_updated, :boolean
    end

    create index(:accounts, [:usage_updated])
  end
end
