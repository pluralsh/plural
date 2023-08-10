defmodule Core.Repo.Migrations.OidcTrustRelationships do
  use Ecto.Migration

  def change do
    create table(:oidc_trust_relationships, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :issuer,  :string, null: false
      add :trust,   :string
      add :scopes,  {:array, :string}

      timestamps()
    end

    create index(:oidc_trust_relationships, [:user_id, :issuer])
  end
end
