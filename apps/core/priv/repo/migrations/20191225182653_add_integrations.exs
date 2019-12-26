defmodule Core.Repo.Migrations.AddIntegrations do
  use Ecto.Migration

  def change do
    create table(:integrations, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :name,        :string, null: false
      add :icon,        :string
      add :icon_id,     :uuid
      add :source_url,  :string
      add :description, :string
      add :spec,        :map

      add :publisher_id,  references(:publishers, type: :uuid, on_delete: :delete_all)
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:integrations, [:repository_id])
    create unique_index(:integrations, [:repository_id, :name])

    create table(:resource_definitions, primary_key: false) do
      add :id,   :uuid, primary_key: true
      add :name, :string, null: false
      add :spec, :map

      timestamps()
    end

    create unique_index(:resource_definitions, [:name])

    alter table(:repositories) do
      add :integration_resource_definition_id, references(:resource_definitions, type: :uuid, on_delete: :nilify_all)
    end
  end
end
