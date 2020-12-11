defmodule Core.Repo.Migrations.AddPrivateRepositories do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :private, :boolean, default: false
    end
  end
end
