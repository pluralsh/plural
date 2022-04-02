defmodule Core.Repo.Migrations.AddTestResources do
  use Ecto.Migration

  def change do
    create table(:tests, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :creator_id,    references(:users, type: :uuid, on_delete: :delete_all)
      add :source_tag,    :string
      add :promote_tag,   :string
      add :status,        :integer

      timestamps()
    end

    create index(:tests, [:repository_id])
    create index(:tests, [:creator_id])

    create table(:test_bindings, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :test_id, references(:tests, type: :uuid, on_delete: :delete_all)
      add :version_id, references(:versions, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:test_bindings, [:test_id])
    create index(:test_bindings, [:version_id])
    create unique_index(:test_bindings, [:test_id, :version_id])

    create table(:test_steps, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :name,        :string
      add :description, :string
      add :status,      :integer
      add :logs,        :string
      add :test_id,     references(:tests, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:test_steps, [:test_id])
    create unique_index(:test_steps, [:test_id, :name])
  end
end
