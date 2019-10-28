defmodule Core.Repo.Migrations.AddReadme do
  use Ecto.Migration

  def change do
    alter table(:versions) do
      add :readme, :binary
    end
  end
end
