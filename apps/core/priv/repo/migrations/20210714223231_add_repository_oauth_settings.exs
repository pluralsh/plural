defmodule Core.Repo.Migrations.AddRepositoryOauthSettings do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :oauth_settings, :map
    end
  end
end
