defmodule Core.Repo.Migrations.AddViolationFile do
  use Ecto.Migration

  def change do
    alter table(:scan_violations) do
      add :file, :string
    end
  end
end
