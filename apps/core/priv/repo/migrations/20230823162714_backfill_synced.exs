defmodule Core.Repo.Migrations.BackfillSynced do
  use Ecto.Migration

  def change do
    execute "update chart_installations set synced = true"
    execute "update terraform_installations set synced = true"
  end
end
