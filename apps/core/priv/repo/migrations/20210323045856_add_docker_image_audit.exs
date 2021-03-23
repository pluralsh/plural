defmodule Core.Repo.Migrations.AddDockerImageAudit do
  use Ecto.Migration

  def change do
    alter table(:audit_logs) do
      add :image_id, references(:docker_images, type: :uuid, on_delete: :delete_all)
    end
  end
end
