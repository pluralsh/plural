defmodule Core.Repo.Migrations.ShellGitInfo do
  use Ecto.Migration

  def change do
    alter table(:cloud_shells) do
      add :git_info, :map
    end
  end
end
