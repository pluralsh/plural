defmodule Core.Repo.Migrations.InstallationPing do
  use Ecto.Migration

  def change do
    alter table(:installations) do
      add :pinged_at, :utc_datetime_usec
    end
  end
end
