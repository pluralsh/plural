defmodule Core.Repo.Migrations.AddPublicKeys do
  use Ecto.Migration

  def change do
    create table(:public_keys, primary_key: false) do
      add :id,      :uuid, primary_key: true
      add :digest,  :string
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :content, :binary

      timestamps()
    end

    create unique_index(:public_keys, [:digest])
    create index(:public_keys, [:user_id])
  end
end
