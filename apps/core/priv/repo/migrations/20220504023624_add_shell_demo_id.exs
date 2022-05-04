defmodule Core.Repo.Migrations.AddShellDemoId do
  use Ecto.Migration

  def change do
    alter table(:cloud_shells) do
      add :demo_id, references(:demo_projects, type: :uuid, on_delete: :delete_all)
    end
  end
end
