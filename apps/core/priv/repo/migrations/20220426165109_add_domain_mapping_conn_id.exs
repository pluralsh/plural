defmodule Core.Repo.Migrations.AddDomainMappingConnId do
  use Ecto.Migration

  def change do
    alter table(:domain_mappings) do
      add :workos_connection_id, :string
    end
  end
end
