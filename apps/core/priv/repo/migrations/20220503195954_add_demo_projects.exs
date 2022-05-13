defmodule Core.Repo.Migrations.AddDemoProjects do
  use Ecto.Migration

  def change do
    create table(:demo_projects, primary_key: false) do
      add :id,           :uuid, primary_key: true
      add :user_id,      references(:users, type: :uuid, on_delete: :nothing)
      add :credentials,  :binary
      add :project_id,   :string
      add :ready,        :boolean, default: false
      add :operation_id, :string
      add :heartbeat,    :utc_datetime_usec

      timestamps()
    end

    create unique_index(:demo_projects, [:user_id])
    create unique_index(:demo_projects, [:project_id])
    create index(:demo_projects, [:inserted_at])
  end
end
