defmodule Core.Repo.Migrations.FixDbUrl do
  use Ecto.Migration

  def change do
    alter table(:postgres_clusters) do
      remove :url
      add :url, :binary
    end
  end
end
