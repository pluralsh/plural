defmodule Core.Repo.Migrations.AddWebhooks do
  use Ecto.Migration

  def change do
    create table(:webhooks, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)
      add :url,    :string
      add :secret, :string

      timestamps()
    end

    create unique_index(:webhooks, [:user_id, :url])
    create index(:webhooks, [:user_id])
  end
end
