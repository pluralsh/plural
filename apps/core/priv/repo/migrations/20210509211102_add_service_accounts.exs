defmodule Core.Repo.Migrations.AddServiceAccounts do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :service_account, :boolean, default: false
    end

    create table(:impersonation_policies, primary_key: false) do
      add :id,      :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create table(:impersonation_policy_bindings, primary_key: false) do
      add :id, :uuid, primary_key: true

      add :user_id,   references(:users, type: :uuid, on_delete: :delete_all)
      add :group_id,  references(:groups, type: :uuid, on_delete: :delete_all)
      add :policy_id, references(:impersonation_policies, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:impersonation_policies, [:user_id])
    create index(:impersonation_policy_bindings, [:user_id])
    create index(:impersonation_policy_bindings, [:group_id])
  end
end
