defmodule Core.Repo.Migrations.AddCommunityToPublishers do
  use Ecto.Migration

  def change do
    alter table(:publishers) do
      add :community, :map
    end

    alter table(:stacks) do
      add :community, :map
    end
  end
end
