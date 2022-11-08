defmodule Core.Repo.Migrations.AddScanCompletedAt do
  use Ecto.Migration

  def change do
    alter table(:docker_images) do
      add :scan_completed_at, :utc_datetime_usec
    end
  end
end
