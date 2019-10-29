defmodule Core.Repo.Migrations.AddChartDescription do
  use Ecto.Migration

  def change do
    alter table(:charts) do
      add :description, :string
    end
  end
end
