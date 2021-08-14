defmodule Core.Repo.Migrations.AddPackageScans do
  use Ecto.Migration

  def change do
    create table(:package_scans, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :grade, :integer
      add :version_id, references(:versions, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:package_scans, [:version_id])

    create table(:scan_errors, primary_key: false) do
      add :id,      :uuid, primary_key: true
      add :scan_id, references(:package_scans, type: :uuid, on_delete: :delete_all)
      add :message, :binary

      timestamps()
    end

    create table(:scan_violations, primary_key: false) do
      add :id,            :uuid, primary_key: true
      add :scan_id,       references(:package_scans, type: :uuid, on_delete: :delete_all)
      add :rule_name,     :string
      add :description,   :binary
      add :rule_id,       :string
      add :severity,      :integer
      add :category,      :string
      add :resource_name, :string
      add :resource_type, :string
      add :line,          :integer

      timestamps()
    end

    create index(:scan_violations, [:scan_id])
    create index(:scan_errors, [:scan_id])
  end
end
