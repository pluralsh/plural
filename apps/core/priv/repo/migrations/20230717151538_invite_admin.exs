defmodule Core.Repo.Migrations.InviteAdmin do
  use Ecto.Migration

  def change do
    alter table(:invites) do
      add :admin, :boolean, default: false
    end
  end
end
