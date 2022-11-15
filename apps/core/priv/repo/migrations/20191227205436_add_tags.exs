defmodule Core.Repo.Migrations.AddTags do
  use Ecto.Migration

  def change do
    create table(:tags, primary_key: false) do
      add :id,            :uuid, primary_key: true
      add :tag,           :string
      add :resource_type, :integer
      add :resource_id,   :uuid

      timestamps()
    end

    create index(:tags, [:tag])
  end
end
