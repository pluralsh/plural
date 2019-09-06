defmodule Core.Repo.Migrations.Bootstrap do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :email, :string, null: false
      add :name, :string
      add :password_hash, :string

      timestamps()
    end

    create unique_index(:users, [:email])

    create table(:publishers, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :owner_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :name, :string, null: false

      timestamps()
    end

    create unique_index(:publishers, [:owner_id])

    create table(:charts, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :publisher_id, references(:publishers, type: :uuid, on_delete: :delete_all)
      add :name, :string, null: false
      add :latest_version, :string

      timestamps()
    end

    create index(:charts, [:publisher_id])
    create unique_index(:charts, [:name])

    create table(:installations, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :chart_id, references(:charts, type: :uuid, on_delete: :delete_all)
      add :version, :string

      timestamps()
    end

    create unique_index(:installations, [:user_id, :chart_id])
    create index(:installations, [:user_id])
    create index(:installations, [:chart_id])

    create table(:versions, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :chart_id, references(:charts, type: :uuid, on_delete: :delete_all)
      add :version, :string

      timestamps()
    end

    create unique_index(:versions, [:chart_id, :version])
    create index(:versions, [:chart_id])
  end
end
