defmodule Core.Repo.Migrations.EabCredentials do
  use Ecto.Migration

  def change do
    create table(:eab_credentials, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :key_id,   :string
      add :hmac_key, :string
      add :user_id,  references(:users, type: :uuid, on_delete: :delete_all)
      add :cluster,  :string
      add :provider, :integer

      timestamps()
    end

    create index(:eab_credentials, [:user_id])
    create unique_index(:eab_credentials, [:user_id, :cluster, :provider])
  end
end
