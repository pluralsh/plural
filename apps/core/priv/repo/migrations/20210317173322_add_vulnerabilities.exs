defmodule Core.Repo.Migrations.AddVulnerabilities do
  use Ecto.Migration

  def change do
    create table(:vulnerabilities, primary_key: false) do
      add :id,                :uuid, primary_key: true
      add :image_id,          references(:docker_images, type: :uuid, on_delete: :delete_all)
      add :title,             :string
      add :description,       :string, size: 1000
      add :vulnerability_id,  :string
      add :package,           :string
      add :installed_version, :string
      add :fixed_version,     :string
      add :layer,             :map
      add :source,            :string
      add :url,               :string
      add :severity,          :integer
      add :cvss,              :map
      add :score,             :float

      timestamps()
    end

    create index(:vulnerabilities, [:image_id])

    alter table(:docker_images) do
      add :scanned_at, :utc_datetime_usec
      add :grade,      :integer
    end

    create index(:docker_images, [:scanned_at])
  end
end
