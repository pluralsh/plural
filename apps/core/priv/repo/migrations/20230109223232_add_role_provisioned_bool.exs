defmodule Core.Repo.Migrations.AddRoleProvisionedBool do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :sa_provisioned, :boolean
    end

    alter table(:platform_plans) do
      add :enterprise, :boolean
    end
  end
end
