defmodule Core.Repo.Migrations.WaitOnServicesEnabled do
  use Ecto.Migration

  def change do
    alter table(:demo_projects) do
      add :state, :integer
      add :enabled_op_id, :string
    end
  end
end
