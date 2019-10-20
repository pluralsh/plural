defmodule Core.Repo.Migrations.AddDocumention do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :description, :string
      add :documentation, :binary
    end

    alter table(:publishers) do
      add :description, :string
    end
  end
end
