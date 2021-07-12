defmodule Core.Repo.Migrations.AddPasswordlessLoginToken do
  use Ecto.Migration

  def change do
    create table(:login_tokens, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :token, :binary
      add :active, :boolean, default: false
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    alter table(:passwordless_logins) do
      add :login_token_id, references(:login_tokens, type: :uuid, on_delete: :nothing)
    end

    create unique_index(:login_tokens, [:token])
    create index(:login_tokens, [:user_id])
  end
end
