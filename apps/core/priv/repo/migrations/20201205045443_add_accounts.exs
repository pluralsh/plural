defmodule Core.Repo.Migrations.AddAccounts do
  use Ecto.Migration

  def change do
    create table(:accounts, primary_key: false) do
      add :id,   :uuid, primary_key: true
      add :name, :string
      add :billing_customer_id, :string
      add :root_user_id, references(:users, type: :uuid)

      timestamps()
    end

    alter table(:users) do
      add :account_id, references(:accounts, type: :uuid)
    end

    rename table(:publishers), :account_id, to: :billing_account_id

    alter table(:publishers) do
      add :account_id, references(:accounts, type: :uuid)
    end

    create index(:accounts, [:root_user_id])
    create unique_index(:accounts, [:name])
    create index(:publishers, [:account_id])
    create index(:users, [:account_id])
    create unique_index(:accounts, [:billing_customer_id])
  end
end
