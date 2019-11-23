defmodule Core.Repo.Migrations.AddLicenses do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :public_key, :binary
      add :private_key, :binary
    end
  end
end
