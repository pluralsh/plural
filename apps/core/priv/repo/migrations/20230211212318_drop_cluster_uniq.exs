defmodule Core.Repo.Migrations.DropClusterUniq do
  use Ecto.Migration

  def change do
    drop unique_index(:clusters, [:owner_id])
    create index(:clusters, [:owner_id])
  end
end
