defmodule Core.Repo.Migrations.AddImageDims do
  use Ecto.Migration

  def change do
    alter table(:files) do
      add :width,  :integer
      add :height, :integer
    end
  end
end
