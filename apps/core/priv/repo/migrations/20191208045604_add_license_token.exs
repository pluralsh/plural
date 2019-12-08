defmodule Core.Repo.Migrations.AddLicenseToken do
  use Ecto.Migration

  def change do
    create table(:license_tokens, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :token, :string
      add :installation_id, references(:installations, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:license_tokens, [:installation_id])
    create unique_index(:license_tokens, [:token])
  end
end
