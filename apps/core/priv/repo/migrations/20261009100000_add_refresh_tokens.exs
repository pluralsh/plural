defmodule Core.Repo.Migrations.AddRefreshTokens do
  use Ecto.Migration

  def change do
    create table(:refresh_tokens, primary_key: false) do
      add :id,         :uuid, primary_key: true
      add :token,      :string
      add :expires_at, :utc_datetime_usec
      add :user_id,    references(:users, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:refresh_tokens, [:token])
    create index(:refresh_tokens, [:user_id])
    create index(:refresh_tokens, [:expires_at])
  end
end
