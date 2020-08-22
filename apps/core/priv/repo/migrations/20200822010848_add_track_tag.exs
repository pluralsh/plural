defmodule Core.Repo.Migrations.AddTrackTag do
  use Ecto.Migration

  def change do
    alter table(:installations) do
      add :track_tag, :string, default: "latest"
    end
  end
end
