defmodule Core.Repo.Migrations.AddShell do
  use Ecto.Migration

  def change do
    create table(:shells, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :target,  :string
      add :command, :string
      add :args, {:array, :string}

      timestamps()
    end

    create table(:databases, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)
      add :engine, :integer
      add :target, :string
      add :port,   :integer

      timestamps()
    end

    create index(:shells, [:repository_id])
    create index(:databases, [:repository_id])
  end
end
