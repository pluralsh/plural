defmodule Core.Repo.Migrations.AddReactionUnique do
  use Ecto.Migration

  def change do
    create unique_index(:reactions, [:message_id, :creator_id, :name])
  end
end
