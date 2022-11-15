defmodule Core.Repo.Migrations.AddScanRetries do
  use Ecto.Migration

  def change do
    alter table(:docker_images) do
      add :scan_retries, :integer, default: 0
    end
  end
end
