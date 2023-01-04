defmodule Core.Repo.Migrations.AddAccountDelinquency do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :delinquent_at, :utc_datetime_usec
    end
  end
end
