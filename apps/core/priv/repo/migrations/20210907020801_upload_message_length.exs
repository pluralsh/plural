defmodule Core.Repo.Migrations.UploadMessageLength do
  use Ecto.Migration

  def change do
    alter table(:upgrades) do
      modify :message, :string, size: 10_000
    end
  end
end
