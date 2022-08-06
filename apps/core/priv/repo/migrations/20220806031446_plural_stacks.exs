defmodule Core.Repo.Migrations.PluralStacks do
  use Ecto.Migration

  def change do
    create table(:stacks, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string, nil: false
      add :description, :string
      add :featured, :boolean, default: false
      add :account_id, references(:accounts, type: :uuid, on_delete: :delete_all)
      add :creator_id, references(:users, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:stacks, [:name])
    create index(:stacks, [:featured])

    create table(:stack_collections, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :provider, :integer, nil: false
      add :stack_id, references(:stacks, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:stack_collections, [:stack_id])
    create unique_index(:stack_collections, [:stack_id, :provider])

    create table(:collection_recipes, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :index, :integer, nil: false
      add :collection_id, references(:stack_collections, type: :uuid, on_delete: :delete_all)
      add :recipe_id, references(:recipes, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:collection_recipes, [:collection_id])
    create unique_index(:collection_recipes, [:collection_id, :recipe_id])
  end
end
