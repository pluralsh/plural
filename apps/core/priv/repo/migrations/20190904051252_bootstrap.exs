defmodule Core.Repo.Migrations.Bootstrap do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :email, :string
      add :name, :string
      add :password_hash, :string

      timestamps()
    end

    create unique_index(:users, [:email])

    create table(:publishers, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :owner_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :name, :string

      timestamps()
    end

    create unique_index(:publishers, [:owner_id])

    create table(:repositories, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :publisher_id, references(:publishers, type: :uuid, on_delete: :delete_all)
      add :name, :string

      timestamps()
    end

    create index(:repositories, [:publisher_id])
    create unique_index(:repositories, [:name])

    create table(:charts, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :name, :string
      add :latest_version, :string

      timestamps()
    end

    create index(:charts, [:repository_id])
    create unique_index(:charts, [:repository_id, :name])

    create table(:installations, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:installations, [:user_id, :repository_id])
    create index(:installations, [:user_id])
    create index(:installations, [:repository_id])

    create table(:versions, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :chart_id, references(:charts, type: :uuid, on_delete: :delete_all)
      add :version, :string
      add :helm, :map

      timestamps()
    end

    create unique_index(:versions, [:chart_id, :version])
    create index(:versions, [:chart_id])

    create table(:chart_installations, primary_key: false) do
      add :id, :uuid, primary_key: false
      add :installation_id, references(:installations, type: :uuid, on_delete: :delete_all)
      add :chart_id, references(:charts, type: :uuid, on_delete: :delete_all)
      add :version_id, references(:versions, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:chart_installations, [:installation_id])
    create index(:chart_installations, [:version_id])
    create unique_index(:chart_installations, [:installation_id, :chart_id])
  end
end
