defmodule Core.Repo.Migrations.AddIntegrationType do
  use Ecto.Migration

  def change do
    alter table(:integrations) do
      add :type, :string
    end

    create index(:integrations, [:type])
  end
end
