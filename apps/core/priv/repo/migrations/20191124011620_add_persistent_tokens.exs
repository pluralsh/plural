defmodule Core.Repo.Migrations.AddPersistentTokens do
  use Ecto.Migration

  def change do
    create table(:persisted_tokens, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :token, :string
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:persisted_tokens, [:token])
  end
end
