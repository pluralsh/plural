defmodule Watchman.Repo.Migrations.AddBuildMessage do
  use Ecto.Migration

  def change do
    alter table(:builds) do
      add :message, :string
    end
  end
end
