defmodule Core.Repo.Migrations.AddEmailConfirmation do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :email_confirmed, :boolean, default: false, null: false
      add :email_confirm_by, :utc_datetime_usec
    end
  end
end
