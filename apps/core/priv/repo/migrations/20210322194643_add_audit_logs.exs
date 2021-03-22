defmodule Core.Repo.Migrations.AddAuditLogs do
  use Ecto.Migration

  def change do
    create table(:audit_logs, primary_key: false) do
      add :id,                     :uuid, primary_key: true
      add :action,                 :string
      add :actor_id,               references(:users, type: :uuid, on_delete: :nothing)
      add :account_id,             references(:accounts, type: :uuid, on_delete: :nothing)
      add :repository_id,          references(:repositories, type: :uuid, on_delete: :nothing)
      add :version_id,             references(:versions, type: :uuid, on_delete: :nothing)
      add :group_id,               references(:groups, type: :uuid, on_delete: :nothing)
      add :role_id,                references(:roles, type: :uuid, on_delete: :nothing)
      add :integration_webhook_id, references(:integration_webhooks, type: :uuid, on_delete: :nothing)

      timestamps()
    end

    create index(:audit_logs, [:account_id, :inserted_at])
  end
end
