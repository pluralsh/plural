defmodule Core.Repo.Migrations.AddBillingAddress do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :billing_address, :map
    end
  end
end
