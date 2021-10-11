defmodule Core.Repo.Migrations.AddUserProvider do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :provider, :integer
    end
  end
end
