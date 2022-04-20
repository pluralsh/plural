defmodule Core.Repo.Migrations.CliNotifications do
  use Ecto.Migration

  def change do
    alter table(:notifications) do
      add :cli, :boolean, default: false
    end
  end
end
