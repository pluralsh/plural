defmodule Core.Repo.Migrations.AddRepoLicenses do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :license, :map
    end
  end
end
