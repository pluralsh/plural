defmodule Core.Repo.Migrations.AddTerraformDesc do
  use Ecto.Migration

  def change do
    alter table(:terraform) do
      add :description, :string
    end
  end
end
