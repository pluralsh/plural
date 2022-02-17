defmodule Core.Repo.Migrations.AddBreakingChanges do
  use Ecto.Migration

  def change do
    alter table(:chart_installations) do
      add :locked, :boolean, default: false
    end

    alter table(:terraform_installations) do
      add :locked, :boolean, default: false
    end
  end
end
