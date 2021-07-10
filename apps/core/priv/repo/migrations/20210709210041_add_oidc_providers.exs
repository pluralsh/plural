defmodule Core.Repo.Migrations.AddOidcProviders do
  use Ecto.Migration

  def change do
    create table(:oidc_providers, primary_key: false) do
      add :id, :uuid, primary_key: true

      add :installation_id, references(:installations, type: :uuid, on_delete: :nothing)
      add :client_id,       :string
      add :client_secret,   :string
      add :redirect_uris,   {:array, :string}

      timestamps()
    end

    create table(:oidc_provider_bindings, primary_key: false) do
      add :id, :uuid, primary_key: true

      add :user_id,     references(:users, type: :uuid, on_delete: :delete_all)
      add :group_id,    references(:groups, type: :uuid, on_delete: :delete_all)
      add :provider_id, references(:oidc_providers, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:oidc_providers, [:client_id])
    create unique_index(:oidc_providers, [:installation_id])
    create index(:oidc_provider_bindings, [:user_id])
    create index(:oidc_provider_bindings, [:group_id])
  end
end
