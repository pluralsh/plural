defmodule Core.Repo.Migrations.AddCloudShells do
  use Ecto.Migration

  def change do
    create table(:cloud_shells, primary_key: false) do
      add :id,              :uuid, primary_key: true
      add :user_id,         references(:users, type: :uuid, on_delete: :delete_all)
      add :provider,        :integer
      add :pod_name,        :string
      add :git_url,         :string
      add :aes_key ,        :binary
      add :ssh_public_key,  :binary
      add :ssh_private_key, :binary
      add :workspace,       :map
      add :credentials,     :map

      timestamps()
    end

    create unique_index(:cloud_shells, [:user_id])
    create unique_index(:cloud_shells, [:pod_name])
  end
end
