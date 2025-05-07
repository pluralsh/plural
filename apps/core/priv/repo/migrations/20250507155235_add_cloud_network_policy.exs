defmodule Core.Repo.Migrations.AddCloudNetworkPolicy do
  use Ecto.Migration

  def change do
    alter table(:console_instances) do
      add :network, :map
      add :oidc,    :map
    end
  end
end
