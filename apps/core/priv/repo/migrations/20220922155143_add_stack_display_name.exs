defmodule Core.Repo.Migrations.AddStackDisplayName do
  use Ecto.Migration

  def change do
    alter table(:stacks) do
      add :display_name, :string
    end
  end
end
