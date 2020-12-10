defmodule Core.Repo.Migrations.AddRoles do
  use Ecto.Migration

  def change do
    create table(:roles, primary_key: false) do
      add :id,           :uuid, primary_key: true
      add :name,         :string
      add :description,  :string
      add :repositories, {:array, :string}
      add :permissions,  :map
      add :account_id,   references(:accounts, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:roles, [:account_id, :name])
    create index(:roles, [:account_id])

    create table(:role_bindings, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all)
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :role_id, references(:roles, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:role_bindings, [:role_id, :group_id])
    create unique_index(:role_bindings, [:role_id, :user_id])
    create index(:role_bindings, [:user_id])
    create index(:role_bindings, [:group_id])
    create index(:role_bindings, [:role_id])
  end
end
