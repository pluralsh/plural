defmodule Core.Repo.Migrations.PublicDkr do
  use Ecto.Migration

  def change do
    alter table(:docker_repositories) do
      add :public, :boolean, default: false
    end
  end
end
