defmodule Core.Repo.Migrations.AddUserEvents do
  use Ecto.Migration

  def change do
    create table(:user_events, primary_key: false) do
      add :id,      :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :event,   :string
      add :data,    :binary

      timestamps()
    end

    create index(:user_events, [:user_id])
  end
end
