defmodule Core.Repo.Migrations.AddServiceProduct do
  use Ecto.Migration

  def change do
    alter table(:platform_plans) do
      add :service_plan, :string
    end

    alter table(:platform_subscriptions) do
      add :metered_id, :string
    end
  end
end
