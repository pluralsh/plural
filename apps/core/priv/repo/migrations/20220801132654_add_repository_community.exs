defmodule Core.Repo.Migrations.AddRepositoryCommunity do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :community, :map
    end
  end
end
