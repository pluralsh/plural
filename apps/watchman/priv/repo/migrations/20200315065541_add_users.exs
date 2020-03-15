defmodule Watchman.Repo.Migrations.AddUsers do
  use Ecto.Migration

  def change do
    create table(:watchman_users, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string
      add :email, :string, null: false
      add :password_hash, :string

      timestamps()
    end

    create unique_index(:watchman_users, [:email])
  end
end
