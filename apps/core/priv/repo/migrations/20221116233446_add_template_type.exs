defmodule Core.Repo.Migrations.AddTemplateType do
  use Ecto.Migration

  def change do
    alter table(:versions) do
      add :template_type, :integer, default: 0
    end
  end
end
