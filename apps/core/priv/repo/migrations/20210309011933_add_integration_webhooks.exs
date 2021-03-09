defmodule Core.Repo.Migrations.AddIntegrationWebhooks do
  use Ecto.Migration

  def change do
    create table(:integration_webhooks, primary_key: false) do
      add :id,         :uuid, primary_key: true
      add :name,       :string
      add :url,        :string
      add :actions,    {:array, :string}
      add :secret,     :string
      add :account_id, references(:accounts, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:integration_webhooks, [:account_id])

    create table(:webhook_logs, primary_key: false) do
      add :id,         :uuid, primary_key: true
      add :state,      :integer
      add :status,     :integer
      add :response,   :binary
      add :attempts,   :integer

      add :webhook_id, references(:integration_webhooks, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:webhook_logs, [:webhook_id])
    create index(:webhook_logs, [:webhook_id, :inserted_at])
  end
end
