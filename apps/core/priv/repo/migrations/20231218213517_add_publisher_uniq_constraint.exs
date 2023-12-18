defmodule Core.Repo.Migrations.AddPublisherUniqConstraint do
  use Ecto.Migration

  def change do
    create unique_index(:publishers, [:name])
  end
end
