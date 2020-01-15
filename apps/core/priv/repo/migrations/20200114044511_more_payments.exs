defmodule Core.Repo.Migrations.MorePayments do
  use Ecto.Migration

  def change do
    alter table(:plans) do
      add :external_id, :string
      add :line_items,  :map
    end

    create index(:plans, [:external_id])

    alter table(:subscriptions) do
      add :line_items, :map
    end
  end
end
