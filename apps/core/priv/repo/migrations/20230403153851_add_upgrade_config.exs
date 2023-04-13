defmodule Core.Repo.Migrations.AddUpgradeConfig do
  use Ecto.Migration

  def change do
    alter table(:upgrades) do
      add :config, :map
    end
  end
end
