defmodule Core.Repo.Migrations.AddUserAttributes do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :phone, :string
      add :address, :map
    end
  end
end
