defmodule Core.Repo.Migrations.AddDnsAccessPolicies do
  use Ecto.Migration

  def change do
    create table(:dns_access_policies, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :domain_id, references(:dns_domains, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create table(:dns_policy_bindings, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all)
      add :policy_id, references(:dns_access_policies, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:dns_access_policies, [:domain_id])
    create index(:dns_policy_bindings, [:policy_id])
  end
end
