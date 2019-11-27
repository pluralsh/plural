defmodule Core.Repo.Migrations.AddDocker do
  use Ecto.Migration

  def change do
    create table(:docker_repositories, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :name, :string

      timestamps()
    end

    create unique_index(:docker_repositories, [:repository_id, :name])
    create index(:docker_repositories, [:repository_id])

    create table(:docker_images, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :docker_repository_id, references(:docker_repositories, type: :uuid, on_delete: :delete_all)
      add :tag, :string
      add :digest, :string

      timestamps()
    end

    create unique_index(:docker_images, [:docker_repository_id, :tag])
    create index(:docker_images, [:docker_repository_id])
  end
end
