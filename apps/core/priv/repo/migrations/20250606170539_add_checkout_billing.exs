defmodule Core.Repo.Migrations.AddCheckoutBilling do
  use Ecto.Migration

  def change do
    alter table(:platform_plans) do
      add :base_price_id,    :string
      add :metered_price_id, :string
    end

    alter table(:platform_subscriptions) do
      add :billing_version, :integer, default: 0
    end
  end
end
