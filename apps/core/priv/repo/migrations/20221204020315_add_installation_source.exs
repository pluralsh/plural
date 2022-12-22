defmodule Core.Repo.Migrations.AddInstallationSource do
  use Ecto.Migration

  def change do
    alter table(:installations) do
      add :source, :integer, default: 0
    end
  end
end
