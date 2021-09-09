defmodule Core.Repo.Migrations.AddRepositoryNotes do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :notes, :binary
    end
  end
end
