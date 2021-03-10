defmodule Core.Repo.Migrations.AddOauthIntegrations do
  use Ecto.Migration

  def change do
    create table(:oauth_integrations, primary_key: false) do
      add :id,            :uuid, primary_key: true
      add :account_id,    references(:accounts, type: :uuid, on_delete: :delete_all)
      add :service,       :integer
      add :access_token,  :string, size: 1000
      add :refresh_token, :string, size: 1000
      add :expires_at,    :utc_datetime_usec

      timestamps()
    end

    create unique_index(:oauth_integrations, [:account_id, :service])
    create index(:oauth_integrations, [:account_id])
  end
end
