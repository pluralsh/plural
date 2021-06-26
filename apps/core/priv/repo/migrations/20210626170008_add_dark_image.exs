defmodule Core.Repo.Migrations.AddDarkImage do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :dark_icon, :string
    end
  end
end
