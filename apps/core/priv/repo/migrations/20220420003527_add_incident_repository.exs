defmodule Core.Repo.Migrations.AddIncidentRepository do
  use Ecto.Migration

  def change do
    alter table(:notifications) do
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :msg,           :binary
    end
  end
end
