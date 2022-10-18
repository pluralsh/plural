defmodule Core.Repo.Migrations.AddUserOnboardingChecklist do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :onboarding_checklist, :map
    end
  end
end
