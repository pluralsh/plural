defmodule Core.Repo.Migrations.AddLicenseKey do
  use Ecto.Migration

  def change do
    alter table(:installations) do
      add :license_key, :string
    end

    create unique_index(:installations, [:license_key])
  end
end
