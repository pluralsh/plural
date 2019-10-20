defmodule Core.Repo.Migrations.AddAvatars do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :avatar_id, :uuid
      add :avatar, :string
    end

    alter table(:publishers) do
      add :avatar_id, :uuid
      add :avatar, :string
    end

    alter table(:repositories) do
      add :icon_id, :uuid
      add :icon, :string
    end

    alter table(:charts) do
      add :icon, :string
    end
  end
end
