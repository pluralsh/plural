defmodule Core.Repo.Migrations.AddPostmortems do
  use Ecto.Migration

  def change do
    create table(:postmortems, primary_key: false) do
      add :id,           :uuid, primary_key: true
      add :incident_id,  references(:incidents, type: :uuid, on_delete: :delete_all)
      add :content,      :binary
      add :action_items, :map
      add :creator_id,   references(:users, type: :uuid, on_delete: :nothing)

      timestamps()
    end

    create unique_index(:postmortems, [:incident_id])

    create table(:notifications, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :user_id,     references(:users, type: :uuid, on_delete: :delete_all)
      add :actor_id,    references(:users, type: :uuid, on_delete: :delete_all)
      add :type,        :integer
      add :incident_id, references(:incidents, type: :uuid, on_delete: :delete_all)
      add :message_id,  references(:incident_messages, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:notifications, [:user_id])
    create index(:notifications, [:incident_id])
    create index(:notifications, [:incident_id, :user_id])

    create table(:followers, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :incident_id, references(:incidents, type: :uuid, on_delete: :delete_all)
      add :preferences, :map

      timestamps()
    end

    create unique_index(:followers, [:incident_id, :user_id])
    create index(:followers, [:incident_id])
    create index(:followers, [:user_id])
  end
end
