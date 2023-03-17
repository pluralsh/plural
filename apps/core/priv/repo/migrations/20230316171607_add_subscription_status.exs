defmodule Core.Repo.Migrations.AddSubscriptionStatus do
  use Ecto.Migration

  def change do
    alter table(:platform_subscriptions) do
      add :status, :integer
    end
  end
end
