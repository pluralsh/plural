defmodule Core.Repo.Migrations.AddStackExpiry do
  use Ecto.Migration

  def change do
    alter table(:stacks) do
      add :expires_at, :utc_datetime_usec
    end
  end
end
