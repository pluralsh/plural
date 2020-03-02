defmodule Core.Repo.Migrations.AddDashboards do
  use Ecto.Migration

  def change do
    create table(:dashboards, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :name, :string
      add :uid, :string

      timestamps()
    end

    create index(:dashboards, [:repository_id])
    create unique_index(:dashboards, [:uid])
  end
end
