defmodule Core.Repo.Migrations.AddPublisherIcon do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :icon_id, :uuid
      add :icon,    :string
    end
  end
end
