defmodule Core.Repo.Migrations.AddRepoGitAttributes do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      add :git_url,  :string
      add :homepage, :string
      add :readme,   :binary
    end
  end
end
