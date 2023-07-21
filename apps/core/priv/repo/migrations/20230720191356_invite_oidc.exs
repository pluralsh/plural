defmodule Core.Repo.Migrations.InviteOidc do
  use Ecto.Migration

  def change do
    alter table(:invites) do
      add :oidc_provider_id, references(:oidc_providers, type: :uuid, on_delete: :delete_all)
      add :service_account_id, references(:users, type: :uuid, on_delete: :delete_all)
    end
  end
end
