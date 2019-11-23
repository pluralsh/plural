defmodule Core.Repo.Migrations.AddAutoUpgrade do
  use Ecto.Migration

  def change do
    alter table(:installations) do
      add :auto_upgrade, :boolean, default: false, null: false
    end
  end
end
