defmodule Core.Repo.Migrations.AddClusterInformation do
  use Ecto.Migration

  def change do
    create table(:cluster_information, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :incident_id, references(:incidents, type: :uuid, on_delete: :delete_all)
      add :git_commit,  :string
      add :platform,    :string
      add :version,     :string

      timestamps()
    end

    create unique_index(:cluster_information, [:incident_id])
  end
end
