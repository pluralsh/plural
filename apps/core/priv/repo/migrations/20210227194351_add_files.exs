defmodule Core.Repo.Migrations.AddFiles do
  use Ecto.Migration

  def change do
    create table(:files, primary_key: false) do
      add :id,           :uuid, primary_key: true
      add :blob,         :string
      add :blob_id,      :uuid
      add :media_type,   :integer
      add :filename,     :string
      add :filesize,     :integer
      add :content_type, :string

      add :message_id,   references(:incident_messages, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:files, [:message_id])

    create table(:incident_history, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :incident_id, references(:incidents, type: :uuid, on_delete: :delete_all)
      add :actor_id,    references(:users, type: :uuid, on_delete: :nothing)

      add :changes,     :map

      timestamps()
    end

    create index(:incident_history, [:incident_id])
  end
end
