defmodule Core.Repo.Migrations.AddDeferredUpdates do
  use Ecto.Migration

  def change do
    alter table(:chart_installations) do
      modify :id, :uuid, primary_key: true
    end

    create table(:deferred_updates, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :chart_installation_id,     references(:chart_installations, type: :uuid, on_delete: :delete_all)
      add :terraform_installation_id, references(:terraform_installations, type: :uuid, on_delete: :delete_all)
      add :version_id, references(:versions, type: :uuid, on_delete: :delete_all)
      add :user_id,    references(:users, type: :uuid, on_delete: :delete_all)
      add :dequeue_at, :utc_datetime_usec
      add :attempts,   :integer, default: 0

      add :reasons, :map

      timestamps()
    end

    create index(:deferred_updates, [:chart_installation_id])
    create index(:deferred_updates, [:terraform_installation_id])
  end
end
