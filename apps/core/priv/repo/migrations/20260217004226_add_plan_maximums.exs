defmodule Core.Repo.Migrations.AddPlanMaximums do
  use Ecto.Migration

  def change do
    alter table(:platform_plans) do
      add :maximum_users,    :integer
      add :maximum_clusters, :integer
    end
  end
end
