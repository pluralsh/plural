defmodule Core.Repo.Migrations.AddDomainMappings do
  use Ecto.Migration

  def change do
    create table(:domain_mappings, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :domain, :string
      add :account_id, references(:accounts, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:domain_mappings, [:domain])
    create index(:domain_mappings, [:account_id])
  end
end
