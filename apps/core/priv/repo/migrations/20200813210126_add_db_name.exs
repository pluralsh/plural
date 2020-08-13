defmodule Core.Repo.Migrations.AddDbName do
  use Ecto.Migration

  def change do
    alter table(:databases) do
      add :name, :string
    end
  end
end
