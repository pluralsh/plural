defmodule Core.Repo.Migrations.AddDomains do
  use Ecto.Migration

  def change do
    create table(:dns_domains, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :name,        :string
      add :creator_id,  references(:users, type: :uuid, on_delete: :delete_all)
      add :account_id,  references(:accounts, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:dns_domains, [:name])
    create index(:dns_domains, [:account_id])

    create table(:dns_records, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :type,        :integer
      add :name,        :string
      add :cluster,     :string
      add :provider,    :integer
      add :records,     {:array, :string}
      add :external_id, :string
      add :creator_id,  references(:users, type: :uuid, on_delete: :delete_all)
      add :domain_id,   references(:dns_domains, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:dns_records, [:domain_id])
    create unique_index(:dns_records, [:name, :type])
    create unique_index(:dns_records, [:external_id])

    execute "ALTER TABLE oidc_providers DROP CONSTRAINT oidc_providers_installation_id_fkey"
    alter table(:oidc_providers) do
      modify :installation_id, references(:installations, type: :uuid, on_delete: :delete_all)
    end
  end
end
