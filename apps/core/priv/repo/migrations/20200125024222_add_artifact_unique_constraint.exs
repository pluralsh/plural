defmodule Core.Repo.Migrations.AddArtifactUniqueConstraint do
  use Ecto.Migration

  def change do
    create unique_index(:artifacts, [:repository_id, :name, :platform])
  end
end
