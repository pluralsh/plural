defmodule Core.Repo.Migrations.AddMainBranch do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :main_branch, :string
    end
  end
end
