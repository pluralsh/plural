defmodule Core.Repo.Migrations.AddUserDemoed do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :demoed, :boolean
    end
  end
end
