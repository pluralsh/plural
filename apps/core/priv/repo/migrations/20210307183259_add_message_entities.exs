defmodule Core.Repo.Migrations.AddMessageEntities do
  use Ecto.Migration

  def change do
    create table(:message_entities, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :type,        :integer
      add :text,        :string
      add :start_index, :integer
      add :end_index,   :integer

      add :user_id,    references(:users, type: :uuid, on_delete: :delete_all)
      add :message_id, references(:incident_messages, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:message_entities, [:message_id])
  end
end
