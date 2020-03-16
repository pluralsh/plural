defmodule Watchman.Repo.Migrations.AddInvites do
  use Ecto.Migration

  def change do
    create table(:watchman_invites, primary_key: false) do
      add :id,        :uuid, primary_key: true
      add :secure_id, :string
      add :email,     :string

      timestamps()
    end

    create unique_index(:watchman_invites, [:secure_id])
  end
end
