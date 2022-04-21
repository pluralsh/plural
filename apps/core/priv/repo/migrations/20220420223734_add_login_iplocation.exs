defmodule Core.Repo.Migrations.AddLoginIplocation do
  use Ecto.Migration

  def change do
    alter table(:oidc_logins) do
      add :ip,        :string
      add :country,   :string
      add :city,      :string
      add :latitude,  :string
      add :longitude, :string
    end
  end
end
