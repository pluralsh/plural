defmodule Core.Repo.Migrations.DropDefaultQueue do
  use Ecto.Migration

  def change do
    alter table(:users) do
      remove :default_queue_id
    end
  end
end
