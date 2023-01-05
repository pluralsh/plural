defmodule Core.Repo.Migrations.AddGrandfatheredUntil do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :grandfathered_until, :utc_datetime_usec
    end
  end
end
