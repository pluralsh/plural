defmodule Core.Repo.Migrations.OidcLoginAccounts do
  use Ecto.Migration

  def change do
    alter table(:oidc_logins) do
      add :account_id, references(:accounts, type: :uuid, on_delete: :nilify_all)
    end
  end
end
