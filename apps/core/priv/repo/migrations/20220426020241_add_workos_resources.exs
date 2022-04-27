defmodule Core.Repo.Migrations.AddWorkosResources do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :external_id, :string
    end

    alter table(:groups) do
      add :external_id, :string
    end

    create unique_index(:users, [:external_id])
    create unique_index(:groups, [:external_id])

    create table(:account_organizations, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :account_id, references(:accounts, type: :uuid, on_delete: :delete_all)
      add :organization_id, :string

      timestamps()
    end

    create unique_index(:account_organizations, [:organization_id])

    create table(:account_directories, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :account_id, references(:accounts, type: :uuid, on_delete: :delete_all)
      add :directory_id, :string

      timestamps()
    end

    create unique_index(:account_directories, [:directory_id])
  end
end
