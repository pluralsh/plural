defmodule Core.Repo.Migrations.AddArtifacts do
  use Ecto.Migration

  def change do
    create table(:artifacts, primary_key: false) do
      add :id,       :uuid, primary_key: true
      add :name,     :string
      add :readme,   :binary
      add :blob,     :string
      add :blob_id,  :uuid
      add :platform, :integer
      add :type,     :integer
      add :sha,      :string
      add :filesize, :bigint
      add :repository_id, references(:repositories, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:artifacts, [:repository_id])
  end
end
