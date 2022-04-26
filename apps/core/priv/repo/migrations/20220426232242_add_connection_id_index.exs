defmodule Core.Repo.Migrations.AddConnectionIdIndex do
  use Ecto.Migration

  def change do
    create index(:domain_mappings, [:workos_connection_id])
  end
end
