defmodule Core.Repo.Migrations.AddInviteGroups do
  use Ecto.Migration

  def change do
    create table(:invite_groups, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :invite_id, references(:invites, type: :uuid, on_delete: :delete_all)
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all)

      timestamps()
    end


    create unique_index(:invite_groups, [:invite_id, :group_id])
    create index(:invite_groups, [:invite_id])
  end
end
