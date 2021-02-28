defmodule Core.Repo.Migrations.AddIncidentHistoryAction do
  use Ecto.Migration

  def change do
    alter table(:incident_history) do
      add :action, :integer
    end
  end
end
