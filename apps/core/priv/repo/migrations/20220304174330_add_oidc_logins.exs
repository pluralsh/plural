defmodule Core.Repo.Migrations.AddOidcLogins do
  use Ecto.Migration

  def change do
    create table(:oidc_logins, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :provider_id, references(:oidc_providers, type: :uuid, on_delete: :delete_all)

      timestamps()
    end
  end
end
