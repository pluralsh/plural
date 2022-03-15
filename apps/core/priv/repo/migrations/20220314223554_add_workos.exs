defmodule Core.Repo.Migrations.AddWorkos do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :workos_connection_id, :string
    end

    alter table(:domain_mappings) do
      add :enable_sso, :boolean, default: false
    end
  end
end
