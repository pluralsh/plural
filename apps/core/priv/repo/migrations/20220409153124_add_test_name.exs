defmodule Core.Repo.Migrations.AddTestName do
  use Ecto.Migration

  def change do
    alter table(:tests) do
      add :name, :string
    end
  end
end
