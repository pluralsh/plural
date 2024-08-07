defmodule Core.Repo.Migrations.AddCloudSchemas do
  use Ecto.Migration

  def change do
    create table(:cloud_clusters, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :name,        :string
      add :external_id, :uuid
      add :cloud,       :integer
      add :region,      :string
      add :count,       :integer, default: 0

      timestamps()
    end

    create table(:cockroach_clusters, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :name,        :string
      add :cloud,       :integer
      add :region,      :string
      add :url,         :string
      add :certificate, :binary
      add :endpoints,   :map
      add :count,       :integer, default: 0

      timestamps()
    end

    create table(:console_instances, primary_key: false) do
      add :id,            :uuid, primary_key: true
      add :name,          :string
      add :cloud,         :integer
      add :size,          :integer
      add :region,        :string
      add :status,        :integer
      add :subdomain,     :string
      add :url,           :string
      add :external_id,   :string
      add :configuration, :map
      add :deleted_at,    :utc_datetime_usec

      add :first_notif_at,  :utc_datetime_usec
      add :second_notif_at, :utc_datetime_usec

      add :instance_status,        :map

      add :cockroach_id, references(:cockroach_clusters, type: :uuid)
      add :cluster_id,   references(:cloud_clusters, type: :uuid)
      add :owner_id,     references(:users, type: :uuid)

      timestamps()
    end

    create unique_index(:console_instances, [:name])
    create unique_index(:console_instances, [:subdomain])
    create unique_index(:console_instances, [:url])

    create unique_index(:cockroach_clusters, [:name])

    create unique_index(:cloud_clusters, [:name])
  end
end
