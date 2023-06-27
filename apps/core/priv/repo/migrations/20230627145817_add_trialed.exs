defmodule Core.Repo.Migrations.AddTrialed do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :trialed, :boolean
    end
  end
end
