defmodule Core.Repo.Migrations.AddIngestMeter do
  use Ecto.Migration

  def change do
    alter table(:platform_plans) do
      add :ingest_meter_price_id, :string
    end
  end
end
