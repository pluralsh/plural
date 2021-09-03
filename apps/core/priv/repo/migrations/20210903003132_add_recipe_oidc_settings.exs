defmodule Core.Repo.Migrations.AddRecipeOidcSettings do
  use Ecto.Migration

  def change do
    alter table(:recipes) do
      add :oidc_settings, :map
    end
  end
end
