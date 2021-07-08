defmodule Core.Repo.Migrations.AddPasswordlessLogin do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :login_method, :integer, default: 0
    end

    create table(:passwordless_logins, primary_key: false) do
      add :id,      :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :token,   :string

      timestamps()
    end

    create unique_index(:passwordless_logins, [:token])
    create index(:passwordless_logins, [:user_id])
  end
end
