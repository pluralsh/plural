defmodule Core.Repo.Migrations.FixClusterConstraints do
  use Ecto.Migration

  def change do
    drop unique_index(:clusters, [:account_id, :provider, :name])
    create unique_index(:clusters, [:owner_id, :provider, :name])
  end
end
