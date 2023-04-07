defmodule Core.Repo.Migrations.AddContributors do
  use Ecto.Migration

  def change do
    create table(:contributors, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:contributors, [:user_id])
    create index(:contributors, [:repository_id])
    create unique_index(:contributors, [:repository_id, :user_id])
  end
end
