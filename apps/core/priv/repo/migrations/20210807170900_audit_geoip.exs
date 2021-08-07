defmodule Core.Repo.Migrations.AuditGeoip do
  use Ecto.Migration

  def change do
    alter table(:audit_logs) do
      add :ip,        :string
      add :country,   :string
      add :city,      :string
      add :latitude,  :string
      add :longitude, :string
    end

    alter table(:access_token_audits) do
      add :country,   :string
      add :city,      :string
      add :latitude,  :string
      add :longitude, :string
    end
  end
end
