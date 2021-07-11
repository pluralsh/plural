defmodule Core.Repo.Migrations.AddOauthAuthMethod do
  use Ecto.Migration

  def change do
    alter table(:oidc_providers) do
      add :auth_method, :integer, default: 0
    end
  end
end
