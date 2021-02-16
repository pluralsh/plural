defmodule Core.Repo.Migrations.AddSupportTickets do
  use Ecto.Migration

  def change do
    create table(:incidents, primary_key: false) do
      add :id,               :uuid, primary_key: true
      add :title,            :string, null: false
      add :description,      :binary
      add :severity,         :integer
      add :next_response_at, :utc_datetime_usec
      add :status,           :integer

      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :creator_id,    references(:users, type: :uuid, on_delete: :nothing)
      add :owner_id,      references(:users, type: :uuid, on_delete: :nothing)

      timestamps()
    end

    create index(:incidents, [:repository_id])
    create index(:incidents, [:repository_id, :title])
    create index(:incidents, [:repository_id, :inserted_at])
    create index(:incidents, [:repository_id, :next_response_at])

    create index(:incidents, [:owner_id])
    create index(:incidents, [:owner_id, :inserted_at])
    create index(:incidents, [:owner_id, :next_response_at])

    create index(:incidents, [:creator_id])
    create index(:incidents, [:creator_id, :inserted_at])

    create table(:incident_messages, primary_key: false) do
      add :id,                 :uuid, primary_key: true
      add :text,               :binary
      add :structured_message, :map

      add :creator_id,  references(:users, type: :uuid, on_delete: :delete_all)
      add :incident_id, references(:incidents, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:incident_messages, [:incident_id, :inserted_at])
    create index(:incident_messages, [:incident_id])

    create table(:reactions, primary_key: false) do
      add :id,   :uuid, primary_key: true
      add :name, :string

      add :message_id, references(:incident_messages, type: :uuid, on_delete: :delete_all)
      add :creator_id, references(:users, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:reactions, [:message_id])
  end
end
