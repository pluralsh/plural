defmodule Core.Repo.Migrations.AddRepoCategories do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :category, :integer
    end

    create index(:repositories, [:category])
  end
end
