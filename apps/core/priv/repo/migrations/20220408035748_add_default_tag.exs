defmodule Core.Repo.Migrations.AddDefaultTag do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :default_tag, :string, default: "latest"
    end
  end
end
