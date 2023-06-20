defmodule Core.Repo.Migrations.AddTrialPlan do
  use Ecto.Migration

  def change do
    alter table(:platform_plans) do
      add :trial, :boolean, default: false
    end
  end
end
