defmodule Core.Repo.Migrations.AddTerraform do
  use Ecto.Migration

  def change do
    create table(:terraform, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string
      add :package, :string
      add :package_id, :uuid
      add :readme, :binary
      add :values_template, :binary
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:terraform, [:repository_id])
    create unique_index(:terraform, [:repository_id, :name])
  end
end
