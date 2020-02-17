defmodule Watchman.Repo.Migrations.AddWebhooks do
  use Ecto.Migration

  def change do
    create table(:watchman_webhooks, primary_key: false) do
      add :id,     :uuid,    primary_key: true
      add :url,    :string,  null: false
      add :type,   :integer, null: false
      add :health, :integer, null: false

      timestamps()
    end

    create unique_index(:watchman_webhooks, [:url])
  end
end
