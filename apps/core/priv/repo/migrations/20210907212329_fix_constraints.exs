defmodule Core.Repo.Migrations.FixConstraints do
  use Ecto.Migration

  def change do
    alter table(:incident_history) do
      modify :actor_id, references(:users, type: :uuid, on_delete: :nilify_all), from: references(:users)
    end

    alter table(:incidents) do
      modify :creator_id, references(:users, type: :uuid, on_delete: :nilify_all), from: references(:users)
      modify :owner_id, references(:users, type: :uuid, on_delete: :nilify_all), from: references(:users)
    end

    alter table(:postmortems) do
      modify :creator_id, references(:users, type: :uuid, on_delete: :nilify_all), from: references(:users)
    end
  end
end
