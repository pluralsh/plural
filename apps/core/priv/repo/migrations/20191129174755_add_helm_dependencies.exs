defmodule Core.Repo.Migrations.AddHelmDependencies do
  use Ecto.Migration

  def change do
    alter table(:charts) do
      add :dependencies, :map
    end

    alter table(:versions) do
      add :dependencies, :map
    end
  end
end
