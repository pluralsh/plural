defmodule Core.Repo.Migrations.AddVerifiedFlag do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :verified, :boolean, default: false
    end
  end
end
