defmodule Core.Repo.Migrations.AddTestPromoteTags do
  use Ecto.Migration

  def change do
    alter table(:tests) do
      add :tags, {:array, :string}
    end
  end
end
