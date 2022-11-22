defmodule Core.Repo.Migrations.AddPlatformPlans do
  use Ecto.Migration

  def change do
    create table(:platform_plans, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :name,        :string
      add :visible,     :boolean, default: true
      add :cost,        :integer
      add :period,      :integer, default: 0
      add :external_id, :string
      add :line_items,  :map
      add :features,    :map

      timestamps()
    end

    create table(:platform_subscriptions, primary_key: false) do
      add :id,           :uuid, primary_key: true
      add :account_id,   references(:accounts, type: :uuid, on_delete: :delete_all)
      add :plan_id,      references(:platform_plans, type: :uuid, on_delete: :delete_all)
      add :external_id,  :string
      add :line_items,   :map

      timestamps()
    end

    create unique_index(:platform_subscriptions, [:account_id])
    create unique_index(:platform_subscriptions, [:external_id])

    alter table(:accounts) do
      add :user_count, :integer, default: 0
    end
  end
end
