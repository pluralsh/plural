defmodule Core.Repo.Migrations.ExtendAudits do
  use Ecto.Migration

  def change do
    alter table(:audit_logs) do
      add :user_id, references(:users, type: :uuid, on_delete: :nilify_all)
      add :dns_domain_id, references(:dns_domains, type: :uuid, on_delete: :nilify_all)
      add :dns_record_id, references(:dns_records, type: :uuid, on_delete: :nilify_all)
    end
  end
end
