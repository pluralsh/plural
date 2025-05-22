defmodule Core.Repo.Migrations.AddEsPasswordField do
  use Ecto.Migration

  def change do
    Core.Services.Cloud.backfill_es_passwords()
  end
end
