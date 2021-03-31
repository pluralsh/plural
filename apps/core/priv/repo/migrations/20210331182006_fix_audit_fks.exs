defmodule Core.Repo.Migrations.FixAuditFks do
  use Ecto.Migration

  def change do
    alter table(:audit_logs) do
      modify :actor_id,               references(:users, type: :uuid, on_delete: :nilify_all), from: references(:users)
      modify :account_id,             references(:accounts, type: :uuid, on_delete: :nilify_all), from: references(:accounts)
      modify :repository_id,          references(:repositories, type: :uuid, on_delete: :nilify_all), from: references(:repositories)
      modify :version_id,             references(:versions, type: :uuid, on_delete: :nilify_all), from: references(:versions)
      modify :group_id,               references(:groups, type: :uuid, on_delete: :nilify_all), from: references(:groups)
      modify :role_id,                references(:roles, type: :uuid, on_delete: :nilify_all), from: references(:roles)
      modify :integration_webhook_id, references(:integration_webhooks, type: :uuid, on_delete: :nilify_all), from: references(:integration_webhooks)
    end
  end
end
