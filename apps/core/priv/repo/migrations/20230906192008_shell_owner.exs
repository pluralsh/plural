defmodule Core.Repo.Migrations.ShellOwner do
  use Ecto.Migration

  def change do
    alter table(:cloud_shells) do
      add :owner_pid, :binary
    end
  end
end
