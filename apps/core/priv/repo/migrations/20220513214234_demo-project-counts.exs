defmodule :"Elixir.Core.Repo.Migrations.Demo-project-counts" do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :demo_count, :integer, default: 0
    end
  end
end
