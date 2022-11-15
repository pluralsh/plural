defmodule Core.Repo.Migrations.AccessTokenAudits do
  use Ecto.Migration

  def change do
    create table(:access_token_audits, primary_key: false) do
      add :id,        :uuid, primary_key: true
      add :token_id,  references(:persisted_tokens, type: :uuid, on_delete: :delete_all)
      add :ip,        :string
      add :timestamp, :utc_datetime_usec
      add :count,     :integer, default: 0

      timestamps()
    end

    create unique_index(:access_token_audits, [:token_id, :ip, :timestamp])
    create index(:access_token_audits, [:token_id])
  end
end
