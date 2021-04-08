defmodule Core.Repo.Migrations.AddQueueAttributes do
  use Ecto.Migration

  def change do
    alter table(:upgrade_queues) do
      add :name,     :string
      add :domain,   :string
      add :git,      :string
      add :provider, :integer
    end

    create unique_index(:upgrade_queues, [:user_id, :name])
  end
end
