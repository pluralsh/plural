defmodule Core.Repo.Migrations.AddTerraformVersions do
  use Ecto.Migration

  def change do
    alter table(:versions) do
      add :package, :string
      add :package_id, :uuid
      add :terraform_id, references(:terraform, type: :uuid, on_delete: :delete_all)
    end

    create index(:versions, [:terraform_id])
    create unique_index(:versions, [:terraform_id, :version])

    alter table(:version_tags) do
      add :terraform_id, references(:terraform, type: :uuid, on_delete: :delete_all)
    end

    create unique_index(:version_tags, [:terraform_id, :tag])
    create index(:version_tags, [:terraform_id])

    alter table(:terraform) do
      add :latest_version, :string
    end

    alter table(:terraform_installations) do
      add :version_id, references(:versions, type: :uuid, on_delete: :delete_all)
    end

    create index(:terraform_installations, [:version_id])
  end
end
