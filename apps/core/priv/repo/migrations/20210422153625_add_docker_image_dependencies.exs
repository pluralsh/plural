defmodule Core.Repo.Migrations.AddDockerImageDependencies do
  use Ecto.Migration

  def change do
    create table(:image_dependencies, primary_key: false) do
      add :id,         :uuid, primary_key: true
      add :version_id, references(:versions, type: :uuid, on_delete: :delete_all)
      add :image_id,   references(:docker_images, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:image_dependencies, [:version_id])
    create index(:image_dependencies, [:image_id])
    create unique_index(:image_dependencies, [:version_id, :image_id])
  end
end
