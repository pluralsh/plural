defmodule Core.Repo.Migrations.AddClusters do
  use Ecto.Migration

  def change do
    create table(:clusters, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :provider,    :integer
      add :name,        :string
      add :domain,      :string
      add :console_url, :string
      add :git_url,     :string
      add :source,      :integer
      add :pinged_at,   :utc_datetime_usec

      add :owner_id,    references(:users, type: :uuid, on_delete: :delete_all)
      add :account_id,  references(:accounts, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:clusters, [:account_id, :provider, :name])
    create unique_index(:clusters, [:owner_id])
    create index(:clusters, [:account_id])

    alter table(:upgrade_queues) do
      add :cluster_id, references(:clusters, type: :uuid, on_delete: :delete_all)
    end

    create unique_index(:upgrade_queues, [:cluster_id])
  end
end
