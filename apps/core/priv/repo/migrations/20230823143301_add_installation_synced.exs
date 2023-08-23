defmodule Core.Repo.Migrations.AddInstallationSynced do
  use Ecto.Migration

  def change do
    alter table(:chart_installations) do
      add :synced, :boolean
    end

    alter table(:terraform_installations) do
      add :synced, :boolean
    end
  end
end
