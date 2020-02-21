defmodule Core.Repo.Migrations.AddSecrets do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :secrets, :map
    end
  end
end
