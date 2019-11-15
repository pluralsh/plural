defmodule Core.Repo.Migrations.AddTfDeps do
  use Ecto.Migration

  def change do
    alter table(:terraform) do
      add :dependencies, :map
    end
  end
end
