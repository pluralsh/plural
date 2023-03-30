defmodule Core.Repo.Migrations.AddReleaseStatus do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :release_status, :integer, default: 0
    end
  end
end
