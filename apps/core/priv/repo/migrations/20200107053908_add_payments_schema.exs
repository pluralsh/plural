defmodule Core.Repo.Migrations.AddPaymentsSchema do
  use Ecto.Migration

  def change do
    alter table(:publishers) do
      add :account_id, :string
    end

    alter table(:users) do
      add :customer_id, :string
    end

    create table(:plans, primary_key: false) do
      add :id,       :uuid, primary_key: true
      add :name,     :string, null: false
      add :default,  :boolean
      add :visible,  :boolean, default: true, null: false
      add :cost,     :integer, null: false
      add :period,   :integer, default: 0, null: false
      add :metadata, :map

      add :repository_id, references(:repositories, type: :uuid, on_delete: :restrict)

      timestamps()
    end

    create unique_index(:plans, [:repository_id, :name])
    create index(:plans, [:repository_id])

    create table(:subscriptions, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :external_id, :string
      add :customer_id, :string

      add :installation_id, references(:installations, type: :uuid, on_delete: :restrict)
      add :plan_id,         references(:plans, type: :uuid, on_delete: :restrict)

      timestamps()
    end

    create unique_index(:subscriptions, [:installation_id])
    create unique_index(:subscriptions, [:external_id])
  end
end
