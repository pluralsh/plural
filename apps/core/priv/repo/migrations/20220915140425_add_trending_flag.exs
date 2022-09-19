defmodule Core.Repo.Migrations.AddTrendingFlag do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :trending, :boolean, default: false
    end
  end
end
