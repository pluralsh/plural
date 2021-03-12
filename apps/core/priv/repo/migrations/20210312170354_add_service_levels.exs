defmodule Core.Repo.Migrations.AddServiceLevels do
  use Ecto.Migration

  def change do
    alter table(:plans, primary_key: false) do
      add :service_levels, :map
    end
  end
end
