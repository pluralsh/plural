defmodule Core.Repo.Migrations.AddKeyNames do
  use Ecto.Migration

  def change do
    alter table(:public_keys) do
      add :name, :string
    end

    create unique_index(:public_keys, [:user_id, :name])
  end
end
