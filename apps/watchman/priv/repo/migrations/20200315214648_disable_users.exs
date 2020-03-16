defmodule Watchman.Repo.Migrations.DisableUsers do
  use Ecto.Migration

  def change do
    alter table(:watchman_users) do
      add :deleted_at, :utc_datetime_usec
    end
  end
end
