defmodule Core.Repo.Migrations.AddRepoDocs do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :docs, :string
    end
  end
end
