defmodule Core.Repo.Migrations.AddVersionTags do
  use Ecto.Migration

  def change do
    create table(:version_tags, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :chart_id, references(:charts, type: :uuid, on_delete: :delete_all)
      add :version_id, references(:versions, type: :uuid, on_delete: :delete_all)
      add :tag, :string

      timestamps()
    end

    create unique_index(:version_tags, [:chart_id, :tag])
    create index(:version_tags, [:chart_id])
    create index(:version_tags, [:version_id])
  end
end
