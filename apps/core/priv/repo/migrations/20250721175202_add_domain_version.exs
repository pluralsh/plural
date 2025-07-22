defmodule Core.Repo.Migrations.AddDomainVersion do
  use Ecto.Migration

  def change do
    alter table(:console_instances) do
      add :domain_version, :integer, default: 0
    end
  end
end
