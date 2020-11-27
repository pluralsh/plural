defmodule Core.Repo.Migrations.AddVersionDigest do
  use Ecto.Migration

  def change do
    alter table(:versions) do
      add :digest, :string
    end
  end
end
