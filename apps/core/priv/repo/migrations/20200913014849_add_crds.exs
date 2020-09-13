defmodule Core.Repo.Migrations.AddCrds do
  use Ecto.Migration

  def change do
    create table(:crds, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :version_id, references(:versions, type: :uuid, on_delete: :delete_all)
      add :blob, :string
      add :blob_id, :uuid
      add :name, :string

      timestamps()
    end

    create unique_index(:crds, [:version_id, :name])
    create index(:crds, [:version_id])
  end
end
