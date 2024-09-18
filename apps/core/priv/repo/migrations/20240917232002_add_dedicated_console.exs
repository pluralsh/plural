defmodule Core.Repo.Migrations.AddDedicatedConsole do
  use Ecto.Migration

  def change do
    alter table(:console_instances) do
      add :type, :integer, default: 0
    end
  end
end
