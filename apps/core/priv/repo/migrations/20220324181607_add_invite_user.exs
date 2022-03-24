defmodule Core.Repo.Migrations.AddInviteUser do
  use Ecto.Migration

  def change do
    alter table(:invites) do
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
    end
  end
end
