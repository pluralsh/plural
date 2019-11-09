defmodule Core.Repo.Migrations.AddTerraformInstallations do
  use Ecto.Migration

  def change do
    create table(:terraform_installations, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :terraform_id, references(:terraform, type: :uuid, on_delete: :delete_all)
      add :installation_id, references(:installations, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:terraform_installations, [:terraform_id, :installation_id])
  end
end
