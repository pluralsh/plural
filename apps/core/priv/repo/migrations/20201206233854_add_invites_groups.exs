defmodule Core.Repo.Migrations.AddInvitesGroups do
  use Ecto.Migration

  def change do
    create table(:invites, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :email, :string
      add :secure_id, :string
      add :account_id, references(:accounts, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create table(:groups, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string
      add :description, :string
      add :global, :boolean
      add :account_id, references(:accounts, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create table(:group_members, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:invites, [:secure_id])
    create unique_index(:invites, [:email])

    create unique_index(:groups, [:account_id, :name])
    create index(:groups, [:account_id])

    create unique_index(:group_members, [:group_id, :user_id])
    create index(:group_members, [:group_id])
    create index(:group_members, [:user_id])
  end
end
