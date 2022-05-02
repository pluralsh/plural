defmodule Core.Repo.Migrations.AddEventStatus do
  use Ecto.Migration

  def change do
    alter table(:user_events) do
      add :status, :integer
    end
  end
end
