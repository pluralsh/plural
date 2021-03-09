defmodule Core.Repo.Migrations.AddLogPayload do
  use Ecto.Migration

  def change do
    alter table(:webhook_logs) do
      add :payload, :map
    end
  end
end
