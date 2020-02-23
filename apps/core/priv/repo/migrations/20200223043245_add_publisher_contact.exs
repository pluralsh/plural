defmodule Core.Repo.Migrations.AddPublisherContact do
  use Ecto.Migration

  def change do
    alter table(:publishers) do
      add :address, :map
      add :phone, :string
    end
  end
end
