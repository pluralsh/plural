defmodule Core.Repo.Migrations.AddValuesTemplate do
  use Ecto.Migration

  def change do
    alter table(:versions) do
      add :values_template, :binary
    end

    alter table(:installations) do
      add :context, :map
    end
  end
end
