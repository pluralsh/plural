defmodule Core.Repo.Migrations.AddArtifactArch do
  use Ecto.Migration

  def change do
    alter table(:artifacts) do
      add :arch, :string, default: "amd64"
    end

    drop unique_index(:artifacts, [:repository_id, :name, :platform])
    create unique_index(:artifacts, [:repository_id, :name, :platform, :arch])
  end
end
