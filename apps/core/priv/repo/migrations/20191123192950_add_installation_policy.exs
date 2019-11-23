defmodule Core.Repo.Migrations.AddInstallationPolicy do
  use Ecto.Migration

  def change do
    alter table(:installations) do
      add :policy, :map
    end
  end
end
