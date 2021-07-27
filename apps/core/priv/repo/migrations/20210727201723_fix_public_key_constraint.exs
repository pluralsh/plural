defmodule Core.Repo.Migrations.FixPublicKeyConstraint do
  use Ecto.Migration

  def change do
    drop index(:public_keys, [:digest])
    create unique_index(:public_keys, [:digest, :user_id])
    create index(:public_keys, [:digest])
  end
end
